const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY; 


const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).json({ message: 'Token manquant' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token invalide' });
    }

    req.user = decoded;
    next(); 
  });
};

module.exports = { isAuthenticated };
