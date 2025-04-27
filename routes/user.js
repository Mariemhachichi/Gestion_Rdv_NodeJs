const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const User = require('../models/User')
const bcrypt = require('bcryptjs');

router.get('/user-info', isAuthenticated, (req, res) => {
  res.send({ user: req.user });
});


// Obtenir tous les clients
router.get('/clients', async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' }, '_id name');
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des clients' });
  }
});

// Obtenir tous les professionnels
router.get('/professionals', async (req, res) => {
  try {
    const pros = await User.find({ role: 'professionel' }, '_id name');
    res.json(pros);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des professionnels' });
  }
});

// Ajouter un nouvel utilisateur
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation simple
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé.' });
    }

    // Créer l'utilisateur
    const newUser = new User({ name, email, password, role });
    await newUser.save();

    res.status(201).json({ message: 'Utilisateur créé avec succès', user: newUser });
  } catch (error) {
    console.error('Erreur lors de la création de l’utilisateur :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de l’utilisateur' });
  }
});

//modif user
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

     // Empêcher la modification du rôle
     delete updates.role;

    // Hacher le mot de passe s’il est fourni
    if (updates.password && updates.password.trim() !== '') {
      updates.password = await bcrypt.hash(updates.password, 10);
    } else {
      delete updates.password; // ne pas écraser avec une chaîne vide
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.json({ message: 'Utilisateur modifié avec succès.', user: updatedUser });
  } catch (error) {
    console.error('Erreur mise à jour :', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});
//Delte users
router.delete('/user/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



module.exports = router;

