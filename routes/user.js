const express = require('express');
const router = express.Router();
const User = require('../models/User')
const bcrypt = require('bcryptjs');


// clients
router.get('/clients', async (req, res) => {
  try {
    const clients = await User.find({ role: 'client' }, '_id name');
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des clients' });
  }
});

// professionnels
router.get('/professionals', async (req, res) => {
  try {
    const pros = await User.find({ role: 'professionel' }, '_id name');
    res.json(pros);
  } catch (err) {
    res.status(500).json({ message: 'Erreur lors de la récupération des professionnels' });
  }
});

// Ajouter user
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé.' });
    }

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
     delete updates.role;

    if (updates.password && updates.password.trim() !== '') {
      updates.password = await bcrypt.hash(updates.password, 10);
    } else {
      delete updates.password; 
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

//Delete user
router.delete('/user/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



module.exports = router;

