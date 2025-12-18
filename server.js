/*
 * Main Server File
 * Integrates Item 15 (RBAC) and Item 16 (Audit Log)
 */
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

// Import our custom modules
const db = require('./config/db'); 
const checkPermission = require('./middleware/rbacMiddleware'); // Item 15
const { logAudit } = require('./services/auditLogger');       // Item 16

const app = express();
app.use(bodyParser.json());

const SECRET_KEY = 'skyr_super_secret_key_123'; // Must match the one in middleware

// ==========================================
// 1. LOGIN ROUTE (To get the JWT Token)
// ==========================================
app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user in DB
        const [users] = await db.execute(
            'SELECT * FROM Users WHERE username = ? AND password_hash = ?', 
            [username, password]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Generate Token (Payload includes user_id and role_id)
        const token = jwt.sign(
            { user_id: user.user_id, role_id: user.role_id, username: user.username },
            SECRET_KEY,
            { expiresIn: '2h' }
        );

        // Log the login action (Item 16)
        await logAudit(user.user_id, "LOGIN", { status: "Success" }, req.ip);

        res.json({ message: 'Login successful', token: token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==========================================
// 2. PROTECTED ROUTE EXAMPLE (Item 15)
// Scenario: Viewing the Flight Dashboard
// User needs 'view' permission on '/dashboard' path
// ==========================================
app.get('/dashboard', checkPermission('/dashboard', 'view'), (req, res) => {
    res.json({ 
        message: 'Welcome to the Dashboard!', 
        data: ['Flight A', 'Flight B', 'Flight C'] 
    });
});

// ==========================================
// 3. CRITICAL ACTION ROUTE (Item 16)
// Scenario: Approving a Roster
// User needs 'edit' permission on '/flights' path + Action is Logged
// ==========================================
app.post('/roster/approve', checkPermission('/flights', 'edit'), async (req, res) => {
    const { rosterId } = req.body;
    const userId = req.user.user_id; // Extracted from token by middleware

    try {
        // Simulate DB Update
        // await db.execute('UPDATE Roster SET status = ? WHERE id = ?', ['Approved', rosterId]);
        console.log(`[DB ACTION] Roster ${rosterId} status updated to Approved.`);

        // LOG THE ACTION (Item 16)
        await logAudit(
            userId, 
            "APPROVE_ROSTER", 
            { roster_id: rosterId, status: "Approved" }, 
            req.ip
        );

        res.json({ message: `Roster ${rosterId} approved and logged successfully.` });

    } catch (error) {
        res.status(500).json({ message: 'Error processing request' });
    }
});

// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});