const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const Rdv = require('../models/Rdv');


// Route pour total utilisateurs
router.get('/api/stats/users', async (req, res) => {
  try {
    const total = await User.countDocuments();
    res.json({ total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});
// Total clients
router.get('/api/stats/clients', async (req, res) => {
    try {
      const totalClients = await User.countDocuments({ role: 'client' });
      res.json({ total: totalClients });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
 
// Total professionnels
router.get('/api/stats/professionnels', async (req, res) => {
    try {
      const totalPros = await User.countDocuments({ role: 'professionel' });
      res.json({ total: totalPros });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  // Total rendez-vous
router.get('/api/stats/rdv', async (req, res) => {
    try {
      const totalRDV = await Rdv.countDocuments(); 
      res.json({ total: totalRDV });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  //affiche table rdv
  router.get('/api/stats/rdvs', async (req, res) => {
    try {
      const rdvs = await Rdv.find()
        .populate('client', 'name')  // ← adapte selon ton modèle User
        .populate('professional', 'name');  // ← idem ici
  
      console.log("RDVs récupérés :", rdvs);
      res.json(rdvs);
    } catch (err) {
      console.error("Erreur RDV :", err);
      res.status(500).json({ message: "Erreur lors de la récupération des rendez-vous" });
    }
  });
  // Récupérer tous les utilisateurs
  router.get('/api/stats/AllUsers', async (req, res) => {
    try {
      const users = await User.find();  // Trouve tous les utilisateurs
      const total = users.length;  // Calculer le nombre total d'utilisateurs
      res.json({ total, users });  // Envoie les utilisateurs avec le total
    } catch (err) {
      console.error("Erreur lors de la récupération des utilisateurs :", err);
      res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
  });

  
  

module.exports = router;
