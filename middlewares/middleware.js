const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  jwt.verify(token, 'secret', (err, user) => {
    if (err) {
      return res.status(403).send({ error: 'Forbidden' });
    }
    req.user = user;
    next();
  });
}

// Authorization middleware for admin
async function isAdmin(req, res, next) {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).send({ error: 'Forbidden' });
    }
    next();
  } catch (error) {
    res.status(500).send({ error: 'Internal Server Error' });
  }
}

module.exports = { authenticateToken, isAdmin };
