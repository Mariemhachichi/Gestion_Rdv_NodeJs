const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth'); 
const Rdv = require('../models/Rdv'); 
const jwt = require('jsonwebtoken');


// Dashboard admin
router.get('/dashboard/admin', isAuthenticated, (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); // Redirection si l'utilisateur n'est pas authentifié
  }
  console.log("Dashboard Admin - Utilisateur :", req.session.user.email);
  res.render('dashboard_admin', { user: req.session.user });
});

router.get('/calendar', (req, res) => {
  res.render('calendar'); 
});


// Dashboard professionnel
router.get('/dashboard/pro', isAuthenticated, (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); // Redirection si l'utilisateur n'est pas authentifié
  }
  console.log("Dashboard Pro - Utilisateur :", req.session.user.email);
  res.render('dashboard_pro', { user: req.session.user });
});

 // Route protégée : Dashboard (client)
 router.get('/dashboard/client', isAuthenticated, async (req, res) => {
  const token = req.cookies.token; // Récupérer le token à partir des cookies
  if (!token) {
    return res.redirect('/login'); // Rediriger si le token est absent
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // Décoder le token
    console.log("Utilisateur décodé :", decoded);

    // Recherche des rendez-vous du client, et peupler le champ 'professional' pour obtenir le nom
    const rdvs = await Rdv.find({ client: decoded._id })
      .populate('professional', 'name'); // Peupler 'professional' avec le champ 'name'

    // Passer les données de l'utilisateur et des rendez-vous à la vue
    res.render('Dashboard_client', { title: 'Client Dashboard', user: decoded, rdvs: rdvs });
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return res.redirect('/login'); // Rediriger en cas d'erreur
  }
});




module.exports = router;
