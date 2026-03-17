import nodemailer from 'nodemailer';

export const createEmailTransporter = (emailUser, emailPassword) => {
  // Configuration pour Gmail avec les paramètres fournis
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword
    }
  });
};

export const sendEmail = async (to, subject, htmlContent, attachments = [], emailUser, emailPassword) => {
  try {
    // Utiliser les credentials fournis ou les variables d'environnement pour la compatibilité rétroactive
    const user = emailUser || process.env.EMAIL_USER;
    const pass = emailPassword || process.env.EMAIL_PASSWORD;

    if (!user || !pass) {
      throw new Error('Identifiants email manquants');
    }

    const transporter = createEmailTransporter(user, pass);
    
    const mailOptions = {
      from: user,
      to,
      subject,
      html: htmlContent,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erreur envoi email:', error);
    return { success: false, error: error.message };
  }
};

export default {
  createEmailTransporter,
  sendEmail
};
