import express from 'express';
import { readJSON, appendJSON, updateJSON, writeJSON } from '../models/fileDb.js';
import { sendEmail } from '../utils/emailService.js';
import { generateLettrePDF } from '../utils/pdfGenerator.js';
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

// Fonction pour créer le message d'email selon le type de candidature
const creerMessageEmail = (entreprise, config, type_candidature) => {
  const poste = config.poste_recherche || 'candidat';
  const nom = config.nom_complet || 'Candidat';
  
  if (type_candidature === 'spontanee') {
    return `
      <p>Bonjour,</p>
      <p>Je vous ai envoyé ci-joint ma candidature spontanée.</p>
      <p>Je serais ravi de discuter des opportunités de collaboration avec votre entreprise.</p>
      <p>Vous trouverez en pièce jointe :</p>
      <ul>
        <li>Ma lettre de motivation</li>
        <li>Mon curriculum vitae</li>
      </ul>
      <p>Je reste à votre disposition pour toute question.</p>
      <p>Cordialement,<br/><strong>${nom}</strong></p>
    `;
  } else {
    // recrutement
    return `
      <p>Bonjour,</p>
      <p>Je vous ai envoyé ci-joint ma candidature pour le poste de <strong>${poste}</strong>.</p>
      <p>Vous trouverez en pièce jointe :</p>
      <ul>
        <li>Ma lettre de motivation</li>
        <li>Mon curriculum vitae</li>
      </ul>
      <p>Je serais heureux de vous exposer en détail comment je pourrais contribuer au succès de votre projet.</p>
      <p>Je reste à votre disposition pour un entretien.</p>
      <p>Cordialement,<br/><strong>${nom}</strong></p>
    `;
  }
};

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

    // Générer le contenu du message avec la lettre de motivation du config
    const subject = `Candidature – ${config.poste_recherche}`;
    const messageContenu = creerMessageEmail(entreprise, config, entreprise.type_candidature);
    
    // Utiliser la lettre de motivation du config pour enrichir le message
    const lettreMotivatoin = remplacerVariables(config.lettre_motivation, entreprise, config);

    try {
      // Préparer les attachments
      const attachments = [];

      // Ajouter le CV depuis le dossier uploads
      const cvPath = path.join(__dirname, '../../uploads/CV.pdf');
      if (fs.existsSync(cvPath)) {
        attachments.push({
          filename: 'CV.pdf',
          path: cvPath
        });
      } else {
        return res.status(400).json({ error: 'Le fichier CV.pdf n\'existe pas dans le dossier uploads' });
      }

      // Créer le message complet: intro + lettre de motivation
      const messageComplet = `
        ${messageContenu}
        
        <hr/>
        
        ${lettreMotivatoin}
      `;

      const result = await sendEmail(entreprise.email, subject, messageComplet, attachments, config.email, appPassword);

      if (result.success) {
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
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      res.status(500).json({ error: emailError.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Générer et retourner la lettre PDF pour téléchargement
router.get('/lettre/:entrepriseId', async (req, res) => {
  try {
    const { entrepriseId } = req.params;
    
    // Récupérer l'entreprise et la config
    const entreprises = readJSON('entreprises.json');
    const entreprise = entreprises.find(e => e.id === entrepriseId);
    const config = readJSON('config.json')[0];

    if (!entreprise) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }

    // Générer la lettre PDF
    const prenom = config.prenom || 'user';
    const nom = config.nom || 'user';
    const safeName = `${prenom}${nom}`.replace(/[^a-zA-Z0-9]/g, '');
    
    const lettrePdfPath = path.join(tmpDir, `Lettre_${safeName}.pdf`);

    // Générer la lettre
    await generateLettrePDF(entreprise, config, lettrePdfPath);

    // Retourner le fichier avec le bon nom
    const filename = `LM-${entreprise.nom_entreprise.replace(/[^a-zA-Z0-9]/g, '')}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    // Envoyer le fichier
    const fileStream = fs.createReadStream(lettrePdfPath);
    fileStream.pipe(res);
    
    // Nettoyer après envoi
    fileStream.on('end', () => {
      fs.unlink(lettrePdfPath, () => {});
    });

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

    // Vérifier que le CV existe
    const cvPath = path.join(__dirname, '../../uploads/CV.pdf');
    if (!fs.existsSync(cvPath)) {
      return res.status(400).json({ error: 'Le fichier CV.pdf n\'existe pas dans le dossier uploads' });
    }

    for (const entreprise of nonEnvoyees) {
      try {
        const subject = `Candidature – ${config.poste_recherche}`;
        const messageContenu = creerMessageEmail(entreprise, config, entreprise.type_candidature);
        const lettreMotivatoin = remplacerVariables(config.lettre_motivation, entreprise, config);

        // Créer le message complet: intro + lettre de motivation
        const messageComplet = `
          ${messageContenu}
          
          <hr/>
          
          ${lettreMotivatoin}
        `;

        // Préparer les attachments
        const attachments = [
          {
            filename: 'CV.pdf',
            path: cvPath
          }
        ];

        const result = await sendEmail(entreprise.email, subject, messageComplet, attachments, config.email, appPassword);

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
