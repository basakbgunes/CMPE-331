const jwt = require('jsonwebtoken');

const JWT_SECRET = 'gizli_anahtar';

// LOGIN: POST /auth/login
async function login(req, res, pool) {
  const { username, password } = req.body;

  console.log('LOGIN BODY:', req.body);

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const [users] = await pool.query(
      'SELECT user_id, username, password_hash, role FROM Users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      console.log('LOGIN ERROR: User not found');
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = users[0];

    // Şimdilik düz string karşılaştırma (hash yoksa)
    if (password !== user.password_hash) {
      console.log('LOGIN ERROR: Password mismatch');
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const payload = {
      userId: user.user_id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    console.log('LOGIN SUCCESS, TOKEN CREATED');

    return res.json({
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

// JWT middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']; // "Bearer xxx"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verify error:', err);
      return res.status(403).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  });
}

module.exports = {
  login,
  authenticateToken
};
