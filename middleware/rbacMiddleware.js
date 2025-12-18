/*
 * Module: Item 15 - Role Based Access Control (RBAC)
 * Description: Checks if the user has permission to access a specific route.
 */
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Uses the database connection from config

const SECRET_KEY = 'skyr_super_secret_key_123'; // Should be in .env in production

const checkPermission = (menuPath, requiredAction = 'view') => {
    return async (req, res, next) => {
        // 1. Check for Token
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token not found!' });
        }

        try {
            // 2. Verify Token
            const user = jwt.verify(token, SECRET_KEY);
            req.user = user; // Attach user info to request

            // 3. Check Permissions in Database
            // Determine if we need to check 'can_edit' or 'can_view'
            const checkColumn = requiredAction === 'edit' ? 'can_edit' : 'can_view';

            const sql = `
                SELECT rmp.${checkColumn} as hasPermission
                FROM Role_Menu_Permission rmp
                JOIN Menu m ON rmp.menu_id = m.menu_id
                WHERE rmp.role_id = ? AND m.path = ?
            `;

            const [rows] = await db.execute(sql, [user.role_id, menuPath]);

            if (rows.length > 0 && rows[0].hasPermission) {
                next(); // Permission granted, proceed
            } else {
                return res.status(403).json({ message: 'Access Denied! You do not have permission.' });
            }

        } catch (err) {
            return res.status(403).json({ message: 'Invalid Token!' });
        }
    };
};

module.exports = checkPermission;