const express = require('express');
const router = express.Router();
const Rdv = require('../models/Rdv');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const { getAdminStats } = require('../services/statService');

// Dashboard Admin
router.get('/admin', isAuthenticated, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find();
    const stats = await getAdminStats();
    res.render('dashboard_admin', { user: req.user, users,stats, title: 'Admin Dashboard' });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Dashboard Professionnel
router.get('/pro', isAuthenticated, requireRole('professionel'), async (req, res) => {
   try {
    const rdvs = await Rdv.find({ professionel: req.user._id }).populate('professional', 'name');
    res.render('dashboard_pro', { user: req.user, rdvs, title: 'Professionnel Dashboard' });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

// Dashboard Client
router.get('/client', isAuthenticated, requireRole('client'), async (req, res) => {
  try {
    const rdvs = await Rdv.find({ client: req.user._id }).populate('professional', 'name');
    res.render('dashboard_client', { user: req.user, rdvs, title: 'Client Dashboard' });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Erreur serveur' });
  }
});

module.exports = router;
