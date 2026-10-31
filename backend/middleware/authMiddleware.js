const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Contains { id, role }
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

const verifyHR = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'hr' || req.user.role === 'manager') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. HR/Manager privilege required.' });
    }
  });
};

module.exports = { verifyToken, verifyHR };