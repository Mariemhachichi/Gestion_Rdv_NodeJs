// middleware/auth.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY; // La clé secrète utilisée pour signer le JWT

// Middleware pour vérifier l'authentification via le JWT
const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token; // Récupérer le token depuis le cookie

  if (!token) {
    return res.status(403).json({ message: 'Token manquant' });
  }

  // Vérifier si le token est valide
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token invalide' });
    }

    // Ajouter les données de l'utilisateur dans la requête pour les utiliser dans la route
    req.user = decoded;
    next(); // Passer à la prochaine étape (la route)
  });
};

module.exports = { isAuthenticated };
