const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmailToProfessional = async (professionalEmail, subject, message) => {
 
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: professionalEmail,
    subject: subject,
    html: message
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès à", professionalEmail);
  } catch (error) {
    console.error("Erreur d'envoi d'email :", error);
  }
};

module.exports = { sendEmailToProfessional };
