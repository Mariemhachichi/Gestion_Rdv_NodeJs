
const jwt = require('jsonwebtoken');
const { getDashboardRouteForRole } = require('../utils/roleRedirect');

function requireRole(expectedRole) {
  return (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect('/login');
    }

    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      if (decoded.role !== expectedRole) {
        // ok
        return res.redirect(getDashboardRouteForRole(decoded.role));
      }

      req.user = decoded;
      next(); 
    } catch (err) {
      console.error('Erreur de vérification du token dans requireRole:', err);
      return res.redirect('/login');
    }
  };
}

module.exports = requireRole;
