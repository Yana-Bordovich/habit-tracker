// server/server.js
import express from 'express';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// === Конфигурация пути (для ESM) ===
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.db');

// === Инициализация приложения ===
const app = express();
const PORT = process.env.PORT || 3001;

// === Middleware ===
app.use(helmet()); // Защита HTTP-заголовков
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Vite + React
    credentials: true
}));
app.use(express.json());

// Rate limiting для входа (защита от брутфорса)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 10,
    message: { success: false, message: 'Слишком много попыток входа. Попробуйте позже.' }
});
app.use('/api/auth', authLimiter);

// === База данных (SQLite) ===
import Database from 'better-sqlite3';
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL'); // Улучшает производительность

console.log('Подключено к SQLite: database.db');

// === Создание таблиц (если их нет) ===
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_data (
    user_id TEXT PRIMARY KEY,
    state TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS communities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    creator_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS community_members (
    community_id INTEGER,
    user_id TEXT,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (community_id, user_id),
    FOREIGN KEY (community_id) REFERENCES communities (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );
`);

// === Вспомогательные функции ===
const getUserByUsername = db.prepare('SELECT * FROM users WHERE username = ?');
const getUserById = db.prepare('SELECT id, username, level, experience FROM users WHERE id = ?');
const insertUser = db.prepare('INSERT INTO users (id, username, passwordHash) VALUES (?, ?, ?)');
const updateUserState = db.prepare('INSERT OR REPLACE INTO user_data (user_id, state) VALUES (?, ?)');
const getUserState = db.prepare('SELECT state FROM user_data WHERE user_id = ?');

// === Middleware: проверка авторизации ===
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ success: false, message: 'Требуется авторизация' });
    }

    const user = getUserById.get(authHeader);
    if (!user) {
        return res.status(401).json({ success: false, message: 'Неверный токен' });
    }

    req.user = user;
    next();
};

// === Роуты: Аутентификация ===
app.post('/api/auth/register', async(req, res) => {
    const { username, password } = req.body;

    if (!username || !password || username.length < 3 || password.length < 6) {
        return res.status(400).json({ success: false, message: 'Некорректные данные' });
    }

    const existingUser = getUserByUsername.get(username);
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Имя занято' });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        insertUser.run(userId, username, passwordHash);

        // Создаём начальное состояние
        const initialState = {
            user: { id: userId, username, level: 1, experience: 0 },
            habits: [],
            achievements: [],
            theme: 'dark',
            primaryColor: '#4F46E5',
            avatarUrl: null
        };

        updateUserState.run(userId, JSON.stringify(initialState));

        res.json({
            success: true,
            user: { id: userId, username },
            token: userId
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
});

app.post('/api/auth/login', async(req, res) => {
    const { username, password } = req.body;

    const user = getUserByUsername.get(username);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ success: false, message: 'Неверные данные' });
    }

    const stateRow = getUserState.get(user.id);
    const state = stateRow ? JSON.parse(stateRow.state) : { habits: [], achievements: [] };

    res.json({
        success: true,
        user: { id: user.id, username: user.username, level: user.level, experience: user.experience },
        token: user.id,
        state
    });
});

// === Роуты: Состояние пользователя ===
app.get('/api/user/state', authenticate, (req, res) => {
    const stateRow = getUserState.get(req.user.id);
    const state = stateRow ? JSON.parse(stateRow.state) : { habits: [], achievements: [] };
    res.json({ success: true, state });
});

app.post('/api/user/state', authenticate, (req, res) => {
    const { state } = req.body;
    if (!state) {
        return res.status(400).json({ success: false, message: 'Нет данных' });
    }

    try {
        updateUserState.run(req.user.id, JSON.stringify(state));
        res.json({ success: true, message: 'Сохранено' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Ошибка сохранения' });
    }
});

// === Роуты: Сообщества ===
app.get('/api/communities', (req, res) => {
    const stmt = db.prepare(`
    SELECT c.*, COUNT(cm.user_id) as members_count
    FROM communities c
    LEFT JOIN community_members cm ON c.id = cm.community_id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `);
    const communities = stmt.all();
    res.json(communities);
});

app.post('/api/communities', authenticate, (req, res) => {
    const { name, description, category } = req.body;
    if (!name || !category) {
        return res.status(400).json({ success: false, message: 'Нужно имя и категория' });
    }

    const stmt = db.prepare(`
    INSERT INTO communities (name, description, category, creator_id)
    VALUES (?, ?, ?, ?)
  `);
    const result = stmt.run(name, description || '', category, req.user.id);

    const community = db.prepare('SELECT * FROM communities WHERE id = ?').get(result.lastInsertRowid);
    res.json(community);
});

app.post('/api/communities/:id/join', authenticate, (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('INSERT OR IGNORE INTO community_members (community_id, user_id) VALUES (?, ?)');
    stmt.run(id, req.user.id);
    res.json({ success: true });
});

app.post('/api/communities/:id/leave', authenticate, (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM community_members WHERE community_id = ? AND user_id = ?');
    stmt.run(id, req.user.id);
    res.json({ success: true });
});

app.delete('/api/communities/:id', authenticate, (req, res) => {
    const { id } = req.params;
    const community = db.prepare('SELECT creator_id FROM communities WHERE id = ?').get(id);
    if (!community || community.creator_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Нет прав' });
    }

    db.prepare('DELETE FROM communities WHERE id = ?').run(id);
    res.json({ success: true });
});

app.get('/api/communities/:id/members', (req, res) => {
    const { id } = req.params;
    const stmt = db.prepare(`
    SELECT u.username, u.level, u.experience, cm.joined_at
    FROM community_members cm
    JOIN users u ON cm.user_id = u.id
    WHERE cm.community_id = ?
    ORDER BY u.experience DESC
  `);
    const members = stmt.all(id);
    res.json(members);
});

app.get('/api/user/communities', authenticate, (req, res) => {
    const stmt = db.prepare(`
    SELECT c.*, 1 as is_member
    FROM communities c
    JOIN community_members cm ON c.id = cm.community_id
    WHERE cm.user_id = ?
  `);
    const communities = stmt.all(req.user.id);
    res.json(communities);
});

// === Запуск сервера ===
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
    console.log(`База данных: ${DB_PATH}`);
});