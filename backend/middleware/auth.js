const jwt = require('jsonwebtoken');
const JWT_SECRET = 'luct_secret';

// Authenticate user token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if(err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Authorize by roles
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if(!req.user) return res.sendStatus(401);
        if(!allowedRoles.includes(req.user.role)) return res.sendStatus(403);
        next();
    };
}

module.exports = { authenticateToken, authorizeRoles };
