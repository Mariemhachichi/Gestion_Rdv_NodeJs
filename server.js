require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser'); 
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const requireRole = require('./middleware/requireRole');

const authRoute = require('./routes/AuthRoute');
const rdvRoute = require('./routes/RdvRoute');
const dashboardRoute = require('./routes/dashboardRoute');
const user = require('./routes/user');
const statsRoute = require('./routes/statsRoute');





const app = express();
const Port = process.env.PORT || 9090;

// Middleware cookies
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

// Middleware pour les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour passer les messages flash et l'utilisateur aux vues
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    res.locals.user = req.session.user;
    next();
});


app.get('/calendar',requireRole('admin'),(req, res) => {
    res.render('calendar',{ user: user });
});

app.get('/rdvss',requireRole('admin'), (req, res) => {
    res.render('rdvss', { user: user });
  });
  


// Routes 
app.use('/', authRoute);
app.use('/', rdvRoute);
app.use('/dashboard', dashboardRoute);
app.use('/', user);
app.use('/', statsRoute);


// Error handling middleware (gestion des erreurs)
app.use((err, req, res, next) => {
    console.error(err.stack); 
    if (err.name === 'MongoError') {
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

// 404 
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

// Connexion MongoDB 
mongoose.connect(process.env.URL_BD, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connecté à MongoDB !");
        
        app.listen(Port, () => {
            console.log(`Serveur démarré sur : ${Port}`);
        });
    })
    .catch(err => {
        console.error("Erreur MongoDB :", err);
        process.exit(1);  
    });
