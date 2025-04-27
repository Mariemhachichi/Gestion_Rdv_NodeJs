// routes/AuthRoute.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');  
const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY; 

// Route pour se connecter
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Vérifier si les champs sont remplis
  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe sont requis' });
  }

  try {
    // Chercher l'utilisateur dans la base de données
    const user = await User.findOne({ email });

    // Vérifier si l'utilisateur existe
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Comparer le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Mot de passe incorrect' });
    }

    // Créer un JWT token
    //const token = jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    const token = jwt.sign({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }, SECRET_KEY, { expiresIn: '1h' });
    


    // Créer une session pour l'utilisateur
    req.session.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    // Envoyer le token dans un cookie sécurisé
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 });

    // Réponse après la connexion
    res.status(200).json({
      message: 'Connexion réussie',
      role: user.role,
    });

  } catch (error) {
    return res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});


// routes/AuthRoute.js
router.post('/logout', (req, res) => {
    // Détruire la session de l'utilisateur
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la déconnexion' });
      }
      // Supprimer le cookie contenant le token
      res.clearCookie('token');
      res.redirect('/login'); // Rediriger l'utilisateur vers la page de connexion
    });
  });
  

  // Route pour s'inscrire
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  // Vérifier que tous les champs sont remplis
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role, // ici il prendra 'client' ou 'professionel' selon le formulaire
    });

    // Sauvegarder dans la base de données
    await newUser.save();

    // Après inscription réussie, tu peux rediriger vers la page de connexion
    res.redirect('/login');

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
});



module.exports = router;
