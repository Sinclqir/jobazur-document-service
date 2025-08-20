const jwt = require('jsonwebtoken');

function authenticateJwt(req, res, next) {
  // Dev bypass: allow disabling auth with an env flag for local testing
  if (process.env.DISABLE_AUTH === 'true') {
    const fallbackUserId = req.headers['x-user-id'] || (req.body && req.body.userId) || req.query.userId;
    req.user = { id: fallbackUserId || '00000000-0000-0000-0000-000000000000' };
    return next();
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return res.status(401).json({ error: 'Missing Authorization header' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId || payload.sub || payload.id };
    if (!req.user.id) return res.status(401).json({ error: 'Invalid token payload' });
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authenticateJwt;


