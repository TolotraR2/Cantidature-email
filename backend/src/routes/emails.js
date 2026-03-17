import express from 'express';
import { readJSON, appendJSON, updateJSON, writeJSON } from '../models/fileDb.js';
import { sendEmail } from '../utils/emailService.js';
import { generateLettrePDF, generateCVPDF } from '../utils/pdfGenerator.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { STATUT_CANDIDATURE } from '../constants.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Créer le répertoire tmp s'il n'existe pas
const tmpDir = path.join(__dirname, '../../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// Fonction pour remplacer les variables dans la lettre de motivation
const remplacerVariables = (lettre, entreprise, config) => {
  if (!lettre) {
    // Fallback si pas de lettre configurée
    return `
      <p>Madame, Monsieur,</p>
      <p>Je vous écris pour vous proposer ma candidature au poste de <strong>${config.poste_recherche}</strong> au sein de votre entreprise <strong>${entreprise.nom_entreprise}</strong>.</p>
      <p>Vous trouverez en pièce jointe mon CV ainsi que ma lettre de motivation.</p>
      <p>Je reste à votre disposition pour discuter de mes qualifications.</p>
      <p>Cordialement,<br/>${config.nom_complet}</p>
    `;
  }

  const today = new Date().toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return lettre
    .replace(/{ENTREPRISE}/g, entreprise.nom_entreprise)
    .replace(/{VILLE}/g, entreprise.ville || '')
    .replace(/{DATE}/g, today)
    .replace(/{NOM}/g, config.nom_complet)
    .replace(/{POSTE}/g, config.poste_recherche)
    .split('\n')
    .map(ligne => `<p>${ligne}</p>`)
    .join('');
};

// Envoyer une candidature unique
router.post('/envoyer-candidature/:entrepriseId', async (req, res) => {
  try {
    const { entrepriseId } = req.params;
    const { appPassword } = req.body;
    
    // Récupérer l'entreprise et la config
    const entreprises = readJSON('entreprises.json');
    const entreprise = entreprises.find(e => e.id === entrepriseId);
    const config = readJSON('config.json')[0];

    if (!entreprise) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }

    if (!config.email || !appPassword) {
      return res.status(400).json({ error: 'Email utilisateur ou mot de passe manquant' });
    }

    // Générer le contenu HTML avec les variables remplacées
    const subject = `Candidature – ${config.poste_recherche}`;
    const htmlContent = remplacerVariables(config.lettre_motivation, entreprise, config);

    // Générer les PDFs avec attachments
    const prenom = config.prenom || 'user';
    const nom = config.nom || 'user';
    const safeName = `${prenom}${nom}`.replace(/[^a-zA-Z0-9]/g, '');
    
    const lettrePdfPath = path.join(tmpDir, `Lettre_${safeName}.pdf`);
    const cvPdfPath = path.join(tmpDir, `Curriculum-vitae-${safeName}.pdf`);

    try {
      // Générer les PDFs
      await generateLettrePDF(entreprise, config, lettrePdfPath);
      await generateCVPDF(config, cvPdfPath);

      // Préparer les attachments
      const attachments = [
        {
          filename: `Lettre_${safeName}.pdf`,
          path: lettrePdfPath
        },
        {
          filename: `Curriculum-vitae-${safeName}.pdf`,
          path: cvPdfPath
        }
      ];

      const result = await sendEmail(entreprise.email, subject, htmlContent, attachments, config.email, appPassword);

      if (result.success) {
        // Nettoyer les fichiers temporaires
        fs.unlink(lettrePdfPath, () => {});
        fs.unlink(cvPdfPath, () => {});

        // Mettre à jour le statut
        const index = entreprises.findIndex(e => e.id === entrepriseId);
        if (index > -1) {
          entreprises[index].statut = STATUT_CANDIDATURE.ENVOYE;
          entreprises[index].date_envoi = new Date().toISOString();
          writeJSON('entreprises.json', entreprises);
        }

        // Enregistrer dans l'historique
        const historique = {
          id: uuidv4(),
          entreprise_id: entrepriseId,
          statut: 'succes',
          message: 'Email envoyé avec succès',
          date_envoi: new Date().toISOString()
        };
        appendJSON('historique.json', historique);

        res.json({ success: true, message: 'Candidature envoyée avec succès' });
      } else {
        throw new Error(result.error);
      }
    } catch (pdfError) {
      res.status(500).json({ error: pdfError.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Envoyer toutes les candidatures non envoyées
router.post('/envoyer-toutes', async (req, res) => {
  try {
    const { appPassword } = req.body;
    
    let entreprises = readJSON('entreprises.json');
    const config = readJSON('config.json')[0];
    
    if (!config.email || !appPassword) {
      return res.status(400).json({ error: 'Email utilisateur ou mot de passe manquant' });
    }
    
    const nonEnvoyees = entreprises.filter(e => e.statut === STATUT_CANDIDATURE.NON_ENVOYE);

    let sent = 0;
    let failed = 0;

    for (const entreprise of nonEnvoyees) {
      try {
        const subject = `Candidature – ${config.poste_recherche}`;
        const htmlContent = remplacerVariables(config.lettre_motivation, entreprise, config);

        const result = await sendEmail(entreprise.email, subject, htmlContent, [], config.email, appPassword);

        if (result.success) {
          sent++;
          const index = entreprises.findIndex(e => e.id === entreprise.id);
          if (index > -1) {
            entreprises[index].statut = STATUT_CANDIDATURE.ENVOYE;
            entreprises[index].date_envoi = new Date().toISOString();
          }
        } else {
          failed++;
          const index = entreprises.findIndex(e => e.id === entreprise.id);
          if (index > -1) {
            entreprises[index].erreur = result.error;
          }
        }

        // Délai entre envois
        await new Promise(resolve => setTimeout(resolve, config.delai_entre_envois * 1000));
      } catch (err) {
        failed++;
        console.error(`Erreur pour ${entreprise.nom_entreprise}:`, err);
      }
    }

    writeJSON('entreprises.json', entreprises);
    res.json({ 
      message: `${sent} candidatures envoyées, ${failed} échouées`,
      sent,
      failed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
