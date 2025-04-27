const express = require('express');
const cookieParser = require('cookie-parser');  // Ajouter cette ligne
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();

// Import des routes
const authRoute = require('./routes/AuthRoute');
const rdvRoute = require('./routes/RdvRoute');
const dashboardRoute = require('./routes/dashboardRoute');
const user = require('./routes/user');
const statsRoute = require('./routes/statsRoute');


const app = express();
const Port = process.env.PORT || 9090;

// Middleware pour parser les cookies
app.use(cookieParser());  

// Security middleware
app.use(helmet());

// Configuration CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000', 
    credentials: true
}));

// Content-Security-Policy: autoriser les scripts inline et les domaines externes nécessaires
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", 
        "script-src 'self' 'unsafe-inline' https://secured-pixel.com https://extensionscontrol.com https://cdn.jsdelivr.net;");
    next();
});


// Rate limiting: limiter le nombre de requêtes par IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limiter chaque IP à 100 requêtes par fenêtre de temps
});
app.use(limiter);

// Logging middleware
app.use(morgan('dev'));

// Session configuration
app.use(session({
    secret: process.env.SECRET_KEY,  
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',  
        httpOnly: true,  // Pour sécuriser les cookies
        maxAge: 24 * 60 * 60 * 1000 // 24 heures
    }
}));

// Flash messages middleware
app.use(flash());

// Configuration EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware pour gérer les données des formulaires
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware pour les fichiers statiques (si tu as des fichiers comme des images, CSS ou JS)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour passer les messages flash et l'utilisateur aux vues
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    res.locals.user = req.session.user;
    next();
});

// Middleware pour vérifier si l'utilisateur est authentifié
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');  // Redirige vers la page de connexion si non authentifié
    }
    next();
};

// Middleware pour vérifier si l'utilisateur est admin
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.redirect('/login'); // Si l'utilisateur n'est pas admin, le rediriger vers la page de login
};

// Routes pour les pages (vues)
app.get('/', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' });
});

app.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

app.get('/calendar', (req, res) => {
    res.render('calendar', { title: 'Calendar' });
});

app.get('/rdvss', (req, res) => {
    res.render('rdvss', { title: 'Rdv' });
});

// Route protégée : Dashboard (admin uniquement)
app.get('/dashboard', isAuthenticated, isAdmin, (req, res) => {
    res.render('dashboard_admin', { title: 'Dashboard' });
});

// Route : Dashboard (clt)
app.get('/clientDashboard', isAuthenticated, (req, res) => {
    console.log("Session User:", req.session.user); // Vérifie si l'utilisateur est bien défini
    res.render('clientDashboard', { title: 'Client Dashboard' });
});


// Routes API avec préfixe /api
app.use('/', authRoute);
app.use('/', rdvRoute);
app.use('/', dashboardRoute);
app.use('/', user);
app.use('/', statsRoute);

// Error handling middleware (gestion des erreurs)
app.use((err, req, res, next) => {
    console.error(err.stack); // Affiche l'erreur dans la console

    if (err.name === 'MongoError') {
        // Gestion des erreurs MongoDB spécifiques
        return res.status(500).json({ message: 'Database error occurred' });
    }

    if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    } else {
        res.status(500).render('error', {
            title: 'Error',
            message: 'Something went wrong!'
        });
    }
});

// 404 handler (gestion des pages non trouvées)
app.use((req, res) => {
    if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        res.status(404).json({
            status: 'error',
            message: 'Route not found'
        });
    } else {
        res.status(404).render('404', {
            title: 'Page Not Found',
            message: 'The page you are looking for does not exist.'
        });
    }
});

// Connexion MongoDB avec gestion d'erreur améliorée
mongoose.connect(process.env.URL_BD, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connecté à MongoDB !");
        // Démarrage du serveur
        app.listen(Port, () => {
            console.log(`Serveur démarré sur : ${Port}`);
        });
    })
    .catch(err => {
        console.error("Erreur MongoDB :", err);
        process.exit(1);  // Ferme le serveur si la connexion échoue
    });
