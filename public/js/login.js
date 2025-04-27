const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const SECRET_KEY = process.env.SECRET_KEY;

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    // Stocker le token dans un cookie
    res.cookie('token', token, {
      httpOnly: true, // empêche le JS d’y accéder
      maxAge: 3600000 // 1 heure
    });

    res.redirect(`/dashboard/${user.role}`); // Redirige vers le bon tableau de bord
  } catch (err) {
    console.error(err);
    res.status(500).send('Erreur serveur');
  }
});
