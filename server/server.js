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
    db = await dbPromise;

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

    // Create communities tables if they don't exist
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

    // --- API ROUTES ---

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

    // Middleware to check for user ID
    const checkAuth = (req, res, next) => {
        const userId = req.headers['authorization'];
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
            const communities = await db.all(`
        SELECT c.*, 
               COUNT(cm.user_id) as members_count,
               (SELECT COUNT(*) FROM habits h WHERE h.community_id = c.id) as habits_count
        FROM communities c
        LEFT JOIN community_members cm ON c.id = cm.community_id
        GROUP BY c.id
        ORDER BY members_count DESC
      `);
            res.json(communities);
        } catch (error) {
            console.error('Get communities error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Create new community
    app.post('/api/communities', checkAuth, async(req, res) => {
        try {
            const { name, description, category } = req.body;
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
               0 as habits_count
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

    // Get community members
    app.get('/api/communities/:id/members', checkAuth, async(req, res) => {
        try {
            const { id } = req.params;
            const members = await db.all(`
        SELECT u.username, u.level, u.experience, cm.joined_at
        FROM community_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.community_id = ?
        ORDER BY u.experience DESC
      `, [id]);
            res.json(members);
        } catch (error) {
            console.error('Get community members error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Get user's communities
    app.get('/api/user/communities', checkAuth, async(req, res) => {
        try {
            const communities = await db.all(`
        SELECT c.*, 
               COUNT(cm.user_id) as members_count,
               (SELECT COUNT(*) FROM habits h WHERE h.community_id = c.id) as habits_count,
               cm.joined_at
        FROM communities c
        JOIN community_members cm ON c.id = cm.community_id
        LEFT JOIN community_members cm2 ON c.id = cm2.community_id
        WHERE cm.user_id = ?
        GROUP BY c.id
        ORDER BY cm.joined_at DESC
      `, [req.userId]);
            res.json(communities);
        } catch (error) {
            console.error('Get user communities error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Leave community
    app.post('/api/communities/:id/leave', checkAuth, async(req, res) => {
        try {
            const { id } = req.params;

            await db.run(
                'DELETE FROM community_members WHERE community_id = ? AND user_id = ?', [id, req.userId]
            );

            res.json({ success: true, message: 'You have left the community' });
        } catch (error) {
            console.error('Leave community error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    // --- START SERVER ---
    app.listen(PORT, () => {
        console.log(`Backend server running on http://localhost:${PORT}`);
        console.log('Database connected and tables are ready.');
    });
}

main().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});