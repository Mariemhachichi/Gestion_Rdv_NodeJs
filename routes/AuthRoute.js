const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');

const SECRET_KEY = process.env.SECRET_KEY;

//login 
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('login', { error: 'Email et mot de passe sont requis' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', { error: 'Utilisateur non trouvé' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.render('login', { error: 'Mot de passe incorrect' });
    }

    //token
    const token = jwt.sign({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }, SECRET_KEY, { expiresIn: '1h' });


    res.cookie('token', token, {
      httpOnly: true,
      secure: false,  
      maxAge: 3600000 
    });

   
    if (user.role === 'admin') {
      return res.redirect('/dashboard/admin');
    } else if (user.role === 'pro') {
      return res.redirect('/dashboard/pro');
    } else {
      return res.redirect('/dashboard/client');
    }
  } catch (error) {
    console.error(error);
    return res.render('login', { error: 'Erreur serveur' });
  }
});

// register
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register' });
});

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Tous les champs sont requis' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Logout
router.get('/logout',isAuthenticated, (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

module.exports = router;
