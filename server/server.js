const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const dbPromise = require('./database');
const { getInitialState } = require('./initialData');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3001;
let db;

async function main() {
    try {
        db = await dbPromise;
        console.log('Database connected successfully');

        // Create all necessary tables
        await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await db.exec(`
      CREATE TABLE IF NOT EXISTS user_data (
        user_id TEXT PRIMARY KEY,
        state TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

        await db.exec(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

        await db.exec(`
      CREATE TABLE IF NOT EXISTS communities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await db.exec(`
      CREATE TABLE IF NOT EXISTS community_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        community_id INTEGER,
        user_id INTEGER,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (community_id) REFERENCES communities (id),
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(community_id, user_id)
      )
    `);

        await db.exec(`
      CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        streak INTEGER DEFAULT 0,
        lastCompleted TEXT,
        community_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (community_id) REFERENCES communities (id)
      )
    `);

        console.log('All tables created or already exist');

        // Seed admin user on first start
        const admin = await db.get('SELECT * FROM users WHERE username = ?', 'admin');
        if (!admin) {
            const adminId = 'admin-' + Date.now();
            const hashedPassword = await bcrypt.hash('password', 10);
            await db.run('INSERT INTO users (id, username, passwordHash) VALUES (?, ?, ?)', adminId, 'admin', hashedPassword);

            const initialState = getInitialState();
            await db.run('INSERT INTO user_data (user_id, state) VALUES (?, ?)', adminId, JSON.stringify(initialState));
            console.log('Admin user created with default password "password".');
        }

        // Seed some example communities
        const existingCommunities = await db.get('SELECT COUNT(*) as count FROM communities');
        if (existingCommunities.count === 0) {
            const exampleCommunities = [{
                    name: 'Morning Rituals',
                    description: 'Community for those who want to start the day with useful habits',
                    category: 'Health'
                },
                {
                    name: 'Sports and Fitness',
                    description: 'Achieve sports goals together!',
                    category: 'Sports'
                },
                {
                    name: 'English Learning',
                    description: 'Daily English practice',
                    category: 'Education'
                },
                {
                    name: 'Productive Morning',
                    description: 'Plan your day and achieve goals',
                    category: 'Productivity'
                }
            ];

            for (const community of exampleCommunities) {
                await db.run(
                    'INSERT INTO communities (name, description, category) VALUES (?, ?, ?)', [community.name, community.description, community.category]
                );
            }
            console.log('Example communities created');
        }

        // --- MIDDLEWARE ---

        // Middleware to check for user ID
        const checkAuth = (req, res, next) => {
            const userId = req.headers['authorization'];
            console.log('Auth header:', userId);
            if (!userId) {
                return res.status(401).json({ message: 'Not authorized' });
            }
            req.userId = userId;
            next();
        };

        const checkAdmin = async(req, res, next) => {
            try {
                const user = await db.get('SELECT username FROM users WHERE id = ?', req.userId);
                if (user && user.username === 'admin') {
                    next();
                } else {
                    res.status(403).json({ message: 'Access denied' });
                }
            } catch (error) {
                res.status(500).json({ message: 'Server error during permission check' });
            }
        };

        // --- API ROUTES ---

        // Debug route
        app.get('/api/debug', (req, res) => {
            console.log('Debug headers:', req.headers);
            res.json({
                message: 'Debug info',
                headers: req.headers,
                authHeader: req.headers['authorization'],
                timestamp: new Date().toISOString()
            });
        });

        // --- AUTH ROUTES ---

        // Registration
        app.post('/api/register', async(req, res) => {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ message: 'Username and password required' });
            }
            if (password.length < 4) {
                return res.status(400).json({ message: 'Password must be at least 4 characters' });
            }

            try {
                const existingUser = await db.get('SELECT * FROM users WHERE username = ?', username);
                if (existingUser) {
                    return res.status(409).json({ message: 'User with this username already exists' });
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                const userId = 'user-' + Date.now();

                await db.run('INSERT INTO users (id, username, passwordHash) VALUES (?, ?, ?)', userId, username, hashedPassword);

                const initialState = getInitialState();
                await db.run('INSERT INTO user_data (user_id, state) VALUES (?, ?)', userId, JSON.stringify(initialState));

                res.status(201).json({ id: userId, username });
            } catch (error) {
                console.error('Registration error:', error);
                res.status(500).json({ message: 'Server error during registration' });
            }
        });

        // Login
        app.post('/api/login', async(req, res) => {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ message: 'Username and password required' });
            }

            try {
                const user = await db.get('SELECT * FROM users WHERE username = ?', username);
                if (!user) {
                    return res.status(401).json({ message: 'Invalid username or password' });
                }

                const isMatch = await bcrypt.compare(password, user.passwordHash);
                if (!isMatch) {
                    return res.status(401).json({ message: 'Invalid username or password' });
                }

                res.json({ id: user.id, username: user.username });
            } catch (error) {
                console.error('Login error:', error);
                res.status(500).json({ message: 'Server error during login' });
            }
        });

        // --- STATE MANAGEMENT ROUTES ---

        // Get user state
        app.get('/api/state', checkAuth, async(req, res) => {
            try {
                const data = await db.get('SELECT state FROM user_data WHERE user_id = ?', req.userId);
                if (data && data.state) {
                    res.json(JSON.parse(data.state));
                } else {
                    console.warn(`No state found for user ${req.userId}, returning initial state.`);
                    res.json(getInitialState());
                }
            } catch (error) {
                console.error('Get state error:', error);
                res.status(500).json({ message: 'Server error while fetching data' });
            }
        });

        // Save user state
        app.post('/api/state', checkAuth, async(req, res) => {
            const state = req.body;
            try {
                await db.run('REPLACE INTO user_data (user_id, state) VALUES (?, ?)', req.userId, JSON.stringify(state));
                res.json({ message: 'Data saved successfully' });
            } catch (error) {
                console.error('Save state error:', error);
                res.status(500).json({ message: 'Server error while saving data' });
            }
        });

        // --- SETTINGS ROUTES ---

        // Get global date override
        app.get('/api/settings/date', checkAuth, async(req, res) => {
            try {
                const setting = await db.get("SELECT value FROM app_settings WHERE key = 'date_override'");
                res.json({ date: setting.value || null });
            } catch (error) {
                console.error('Get date setting error:', error);
                res.status(500).json({ message: 'Server error' });
            }
        });

        // Set global date override (admin only)
        app.post('/api/settings/date', checkAuth, checkAdmin, async(req, res) => {
            const { date } = req.body;
            try {
                if (date) {
                    await db.run("INSERT OR REPLACE INTO app_settings (key, value) VALUES ('date_override', ?)", date);
                } else {
                    await db.run("DELETE FROM app_settings WHERE key = 'date_override'");
                }
                res.json({ message: 'Date successfully updated for all users' });
            } catch (error) {
                console.error('Set date setting error:', error);
                res.status(500).json({ message: 'Server error' });
            }
        });

        // --- COMMUNITIES API ROUTES ---

        // Get all communities
        app.get('/api/communities', checkAuth, async(req, res) => {
            try {
                console.log('Fetching communities for user:', req.userId);
                const communities = await db.all(`
          SELECT c.*, 
                 COUNT(cm.user_id) as members_count,
                 0 as habits_count,
                 EXISTS(
                   SELECT 1 FROM community_members cm2 
                   WHERE cm2.community_id = c.id AND cm2.user_id = ?
                 ) as is_member,
                 (SELECT cm3.user_id FROM community_members cm3 
                  WHERE cm3.community_id = c.id 
                  ORDER BY cm3.joined_at ASC 
                  LIMIT 1) = ? as is_creator
          FROM communities c
          LEFT JOIN community_members cm ON c.id = cm.community_id
          GROUP BY c.id
          ORDER BY members_count DESC
        `, [req.userId, req.userId]);
                console.log('Found communities:', communities.length);
                res.json(communities);
            } catch (error) {
                console.error('Get communities error:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Get user's communities
        app.get('/api/user/communities', checkAuth, async(req, res) => {
            try {
                console.log('Fetching user communities for:', req.userId);
                const communities = await db.all(`
          SELECT c.*, 
                 COUNT(cm.user_id) as members_count,
                 0 as habits_count,
                 cm.joined_at,
                 (SELECT cm2.user_id FROM community_members cm2 
                  WHERE cm2.community_id = c.id 
                  ORDER BY cm2.joined_at ASC 
                  LIMIT 1) = ? as is_creator
          FROM communities c
          JOIN community_members cm ON c.id = cm.community_id
          WHERE cm.user_id = ?
          GROUP BY c.id
          ORDER BY cm.joined_at DESC
        `, [req.userId, req.userId]);
                console.log('Found user communities:', communities.length);
                res.json(communities);
            } catch (error) {
                console.error('Get user communities error:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Create new community
        app.post('/api/communities', checkAuth, async(req, res) => {
            try {
                const { name, description, category } = req.body;
                console.log('Creating community:', { name, description, category, userId: req.userId });

                if (!name || !description || !category) {
                    return res.status(400).json({ error: 'All fields are required' });
                }

                const result = await db.run(
                    'INSERT INTO communities (name, description, category, created_at) VALUES (?, ?, ?, datetime("now"))', [name, description, category]
                );

                // Automatically add creator to members
                await db.run(
                    'INSERT INTO community_members (community_id, user_id, joined_at) VALUES (?, ?, datetime("now"))', [result.lastID, req.userId]
                );

                const newCommunity = await db.get(`
          SELECT c.*, 
                 COUNT(cm.user_id) as members_count,
                 0 as habits_count,
                 true as is_creator
          FROM communities c
          LEFT JOIN community_members cm ON c.id = cm.community_id
          WHERE c.id = ?
          GROUP BY c.id
        `, [result.lastID]);

                res.json(newCommunity);
            } catch (error) {
                console.error('Create community error:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Join community
        app.post('/api/communities/:id/join', checkAuth, async(req, res) => {
            try {
                const { id } = req.params;
                console.log('User', req.userId, 'joining community', id);

                // Check if community exists
                const community = await db.get('SELECT * FROM communities WHERE id = ?', [id]);
                if (!community) {
                    return res.status(404).json({ error: 'Community not found' });
                }

                // Check if user is already a member
                const existing = await db.get(
                    'SELECT * FROM community_members WHERE community_id = ? AND user_id = ?', [id, req.userId]
                );

                if (existing) {
                    return res.status(400).json({ error: 'You are already a member of this community' });
                }

                await db.run(
                    'INSERT INTO community_members (community_id, user_id, joined_at) VALUES (?, ?, datetime("now"))', [id, req.userId]
                );

                res.json({ success: true, message: 'You have successfully joined the community' });
            } catch (error) {
                console.error('Join community error:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Leave community
        app.post('/api/communities/:id/leave', checkAuth, async(req, res) => {
            try {
                const { id } = req.params;
                console.log('User', req.userId, 'leaving community', id);

                await db.run(
                    'DELETE FROM community_members WHERE community_id = ? AND user_id = ?', [id, req.userId]
                );

                res.json({ success: true, message: 'You have left the community' });
            } catch (error) {
                console.error('Leave community error:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Delete community
        app.delete('/api/communities/:id', checkAuth, async(req, res) => {
            try {
                const { id } = req.params;
                console.log('User', req.userId, 'deleting community', id);

                // Check if user is the creator of the community
                const community = await db.get(`
          SELECT c.*, 
                 (SELECT cm.user_id FROM community_members cm 
                  WHERE cm.community_id = c.id 
                  ORDER BY cm.joined_at ASC 
                  LIMIT 1) as creator_id
          FROM communities c
          WHERE c.id = ?
        `, [id]);

                if (!community) {
                    return res.status(404).json({ error: 'Community not found' });
                }

                if (community.creator_id !== req.userId) {
                    return res.status(403).json({ error: 'Only the community creator can delete the community' });
                }

                // Delete in correct order (due to foreign keys)
                await db.run('DELETE FROM community_members WHERE community_id = ?', [id]);
                await db.run('DELETE FROM habits WHERE community_id = ?', [id]);
                await db.run('DELETE FROM communities WHERE id = ?', [id]);

                res.json({ success: true, message: 'Community deleted successfully' });
            } catch (error) {
                console.error('Delete community error:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // Get community members
        app.get('/api/communities/:id/members', checkAuth, async(req, res) => {
            try {
                const { id } = req.params;
                console.log('Fetching members for community:', id);

                const members = await db.all(`
          SELECT u.username, u.level, u.experience, cm.joined_at
          FROM community_members cm
          JOIN users u ON cm.user_id = u.id
          WHERE cm.community_id = ?
          ORDER BY u.experience DESC
        `, [id]);

                console.log('Found members:', members.length);
                res.json(members);
            } catch (error) {
                console.error('Get community members error:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // --- START SERVER ---
        app.listen(PORT, () => {
            console.log(`Backend server running on http://localhost:${PORT}`);
            console.log('Database connected and tables are ready.');
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

main();