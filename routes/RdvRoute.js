const express = require('express');
const Rdv = require('../models/Rdv');
const router = express.Router();
const { sendEmailToProfessional } = require('../services/emailService'); 
const User = require('../models/User')

// Ajouter un Rdv
router.post('/rdv/add', async (req, res) => {
    const { date, professional, client, description } = req.body;

    if (!professional) {
        return res.status(400).send({ message: 'Le champ professional est requis' });
    }

    if (!client) {
        return res.status(400).send({ message: 'Le champ client est requis' });
    }

    try {
        console.log("Données reçues:", { date, professional, client, description });

        const newRdv = new Rdv({
            date,
            professional,
            client,
            description
        });

        await newRdv.save();
        console.log("Rendez-vous créé avec succès:", newRdv);

        // Trouver l'email du professionnel à partir de l'ID
        const professionalData = await User.findById(professional);  
        console.log("Données du professionnel:", professionalData);

        if (!professionalData || !professionalData.email) {
            return res.status(400).send({ message: 'Email du professionnel non trouvé' });
        }

        
        // Trouver le nom du client à partir de l'ID
        const clientData = await User.findById(client);  
        console.log("Données du client:", clientData);

        if (!clientData) {
            return res.status(400).send({ message: 'Client non trouvé' });
        }


        // Utiliser l'email réel du professionnel
        const professionalEmail = professionalData.email;
        const subject = 'Nouveau rendez-vous créé';
        const message = `
          <p>Un nouveau rendez-vous a été créé pour vous :</p>
          <ul>
            <li><strong>Description :</strong> ${description}</li>
            <li><strong>Date :</strong> ${new Date(date).toLocaleString()}</li>
            <li><strong>Client :</strong>  ${clientData.name}</li>
          </ul>
        `;

        await sendEmailToProfessional(professionalEmail, subject, message);
        console.log("Email envoyé avec succès à", professionalEmail);

        return res.status(201).send({ message: 'Rendez-vous créé avec succès', rdv: newRdv });
    } catch (err) {
        console.error("Erreur:", err);  // Affichage de l'erreur dans les logs
        return res.status(500).send({ message: 'Erreur serveur lors de la création du rendez-vous' });
    }
});


// Modifier un Rdv
router.put('/rdv/:id', async (req, res) => {
    const { date, professional, client, description, status } = req.body;
    const rdvId = req.params.id;

    try {
        const rdv = await Rdv.findById(rdvId);

        if (!rdv) {
            return res.status(404).send({ message: 'Rendez-vous non trouvé' });
        }

        // Mise à jour des champs
        rdv.date = date || rdv.date;
        rdv.professional = professional || rdv.professional;
        rdv.client = client || rdv.client;
        rdv.description = description || rdv.description;
        rdv.status = status || rdv.status;

        // Enregistrement
        const updatedRdv = await rdv.save();
        console.log('Rendez-vous mis à jour:', updatedRdv); // Pour vérifier dans les logs
        res.status(200).send({ message: 'Rendez-vous modifié', rdv: updatedRdv });
    } catch (err) {
        console.error(err); // Affichage de l'erreur dans les logs
        return res.status(500).send({ message: 'Erreur serveur lors de la modification' });
    }
});


// Obtenir tous les Rdvs
router.get('/Rdvs', async (req, res) => {
    try {
        const rdvs = await Rdv.find()
            .populate('professional', 'name')
            .populate('client', 'name');

        // On ajoute l'ID pour chaque événement
        const events = rdvs.map(rdv => ({
            id: rdv._id,  // MongoDB générera un ObjectId unique
            title: `${rdv.client.name} avec ${rdv.professional.name}`,  
            start: rdv.date,
            extendedProps: {
                client: rdv.client.name,
                professional: rdv.professional.name,
                description: rdv.description,
                status: rdv.status
            }
        }));

        res.status(200).json(events);
    } catch (err) {
        res.status(500).send({ message: 'Erreur serveur lors de la récupération des rendez-vous' });
    }
});


// Supprimer un Rdv
router.delete('/rdv/:id', async (req, res) => {
    const rdvId = req.params.id;

    try {
        const rdv = await Rdv.findByIdAndDelete(rdvId);

        if (!rdv) {
            return res.status(404).send({ message: 'Rendez-vous non trouvé' });
        }

        res.status(200).send({ message: 'Rendez-vous supprimé avec succès' });
    } catch (err) {
        return res.status(500).send({ message: 'Erreur serveur lors de la suppression' });
    }
});

module.exports = router;
