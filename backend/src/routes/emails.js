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
  const prenom = config.prenom || 'Candidat';
  
  if (type_candidature === 'spontanee') {
    return `
      <p>Bonjour,</p>
      <p>Je vous ai envoyé ci-joint ma candidature spontanée pour un poste chez vous.</p>
      <p>Vous trouverez en pièce jointe:</p>
      <p>Lettre de motivation et curriculum vitae</p>
      <p>Je reste à votre disposition pour toutes questions.</p>
      <p>Cordialement<br/>${prenom}</p>
    `;
  } else {
    // recrutement
    return `
      <p>Bonjour,</p>
      <p>Je vous ai envoyé ci-joint ma candidature pour un poste chez vous.</p>
      <p>Vous trouverez en pièce jointe:</p>
      <p>Lettre de motivation et curriculum vitae</p>
      <p>Je reste à votre disposition pour toutes questions.</p>
      <p>Cordialement<br/>${prenom}</p>
    `;
  }
};

// Envoyer une candidature unique
router.post('/envoyer-candidature/:entrepriseId', async (req, res) => {
  try {
    const { entrepriseId } = req.params;
    const { appPassword } = req.body;
    
    console.log('=== ENVOYER UNE CANDIDATURE ===');
    console.log('Entreprise ID:', entrepriseId);
    
    // Récupérer l'entreprise et la config
    const entreprises = readJSON('entreprises.json');
    const entreprise = entreprises.find(e => e.id === entrepriseId);
    const config = readJSON('config.json')[0];

    console.log('Entreprise trouvée:', !!entreprise);
    console.log('Config email:', config?.email);
    console.log('Password reçu:', !!appPassword);

    if (!entreprise) {
      console.error('Erreur: Entreprise non trouvée');
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }

    if (!config.email || !appPassword) {
      console.error('Erreur: Email ou password manquant');
      return res.status(400).json({ error: 'Email utilisateur ou mot de passe manquant' });
    }

    // Vérifier CV
    const cvPath = path.join(__dirname, '../../uploads/CV.pdf');
    console.log('Chemin CV:', cvPath);
    console.log('CV existe:', fs.existsSync(cvPath));
    
    if (!fs.existsSync(cvPath)) {
      console.error('Erreur: CV.pdf introuvable');
      return res.status(400).json({ error: 'Le fichier CV.pdf n\'existe pas dans le dossier uploads' });
    }

    // Vérifier lettre de motivation
    if (!config.lettre_motivation || config.lettre_motivation.trim() === '') {
      console.error('Erreur: Lettre de motivation vide');
      return res.status(400).json({ error: 'Veuillez ajouter une lettre de motivation dans Configuration' });
    }
    console.log('Lettre de motivation OK');

    // Générer le contenu du message avec la lettre de motivation du config
    const subject = `Candidature – ${config.poste_recherche}`;
    const messageContenu = creerMessageEmail(entreprise, config, entreprise.type_candidature);

    try {
      // Préparer les attachments
      const attachments = [];
      const nomSafeCV = (config.nom_complet || 'CV').replace(/[^a-zA-Z0-9\s-]/g, '').trim();

      // Renommer le CV avec le nom de l'utilisateur
      if (fs.existsSync(cvPath)) {
        const cvRenamedPath = path.join(tmpDir, `Curriculum_vitae-${nomSafeCV}.pdf`);
        
        // Copier le CV avec le nouveau nom
        fs.copyFileSync(cvPath, cvRenamedPath);
        console.log('CV copié et renommé:', cvRenamedPath);
        
        attachments.push({
          filename: `Curriculum_vitae-${nomSafeCV}.pdf`,
          path: cvRenamedPath
        });
      } else {
        console.error('Erreur: CV.pdf introuvable (double vérification)');
        return res.status(400).json({ error: 'Le fichier CV.pdf n\'existe pas dans le dossier uploads' });
      }

      // Générer le PDF de la lettre de motivation personnalisée
      const lettreTextePure = config.lettre_motivation
        .replace(/{ENTREPRISE}/g, entreprise.nom_entreprise)
        .replace(/{VILLE}/g, entreprise.ville || '')
        .replace(/{DATE}/g, new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }))
        .replace(/{NOM}/g, config.nom_complet)
        .replace(/{POSTE}/g, config.poste_recherche);

      const lmPdfPath = path.join(tmpDir, `Lettre_Motivation-${nomSafeCV}.pdf`);
      await generateLettrePDF(entreprise, config, lmPdfPath, lettreTextePure);
      console.log('PDF de lettre de motivation généré:', lmPdfPath);

      attachments.push({
        filename: `Lettre_Motivation-${nomSafeCV}.pdf`,
        path: lmPdfPath
      });

      const result = await sendEmail(entreprise.email, subject, messageContenu, attachments, config.email, appPassword);

      if (result.success) {
        console.log('Email envoyé avec succès à:', entreprise.email);
        console.log('Message ID:', result.messageId);
        
        // Nettoyer les fichiers renommés du tmp
        attachments.forEach(att => {
          if (att.path.includes('/tmp') || att.path.includes('\\tmp')) {
            fs.unlink(att.path, (err) => {
              if (err) console.error('Erreur suppression fichier temporaire:', err);
            });
          }
        });
        
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
        console.error('Erreur sendEmail:', result.error);
        throw new Error(result.error);
      }
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      res.status(500).json({ error: emailError.message });
    }
  } catch (error) {
    console.error('Erreur global:', error);
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

    // Préparer la lettre personnalisée avec les variables remplacées
    const lettreTextePure = config.lettre_motivation
      .replace(/{ENTREPRISE}/g, entreprise.nom_entreprise)
      .replace(/{VILLE}/g, entreprise.ville || '')
      .replace(/{DATE}/g, new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }))
      .replace(/{NOM}/g, config.nom_complet)
      .replace(/{POSTE}/g, config.poste_recherche);

    // Générer la lettre
    await generateLettrePDF(entreprise, config, lettrePdfPath, lettreTextePure);

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
    
    console.log('=== ENVOYER TOUTES ===');
    console.log('Config:', { email: config?.email, hasPassword: !!appPassword });
    console.log('Nombres entreprises:', entreprises.length);
    
    if (!config.email || !appPassword) {
      console.error('Erreur: Email ou password manquant');
      return res.status(400).json({ error: 'Email utilisateur ou mot de passe manquant' });
    }
    
    const nonEnvoyees = entreprises.filter(e => e.statut === STATUT_CANDIDATURE.NON_ENVOYE);
    console.log('Entreprises à envoyer:', nonEnvoyees.length);

    let sent = 0;
    let failed = 0;

    // Vérifier que le CV existe
    const cvPath = path.join(__dirname, '../../uploads/CV.pdf');
    console.log('Chemin CV:', cvPath);
    console.log('CV existe:', fs.existsSync(cvPath));
    
    if (!fs.existsSync(cvPath)) {
      console.error('Erreur: CV.pdf introuvable');
      return res.status(400).json({ error: 'Le fichier CV.pdf n\'existe pas dans le dossier uploads' });
    }

    // Vérifier lettre de motivation
    if (!config.lettre_motivation || config.lettre_motivation.trim() === '') {
      console.error('Erreur: Lettre de motivation vide');
      return res.status(400).json({ error: 'Veuillez ajouter une lettre de motivation dans Configuration' });
    }
    console.log('Lettre de motivation OK');

    for (const entreprise of nonEnvoyees) {
      try {
        const subject = `Candidature – ${config.poste_recherche}`;
        const messageContenu = creerMessageEmail(entreprise, config, entreprise.type_candidature);

        // Préparer les attachments - renommer le CV avec le nom de l'utilisateur
        const nomSafeCV = (config.nom_complet || 'CV').replace(/[^a-zA-Z0-9\s-]/g, '').trim();
        const cvRenamedPath = path.join(tmpDir, `Curriculum_vitae-${nomSafeCV}.pdf`);
        fs.copyFileSync(cvPath, cvRenamedPath);
        
        // Générer le PDF de la lettre de motivation personnalisée
        const lettreTextePure = config.lettre_motivation
          .replace(/{ENTREPRISE}/g, entreprise.nom_entreprise)
          .replace(/{VILLE}/g, entreprise.ville || '')
          .replace(/{DATE}/g, new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }))
          .replace(/{NOM}/g, config.nom_complet)
          .replace(/{POSTE}/g, config.poste_recherche);

        const lmPdfPath = path.join(tmpDir, `Lettre_Motivation-${nomSafeCV}.pdf`);
        await generateLettrePDF(entreprise, config, lmPdfPath, lettreTextePure);

        const attachments = [
          {
            filename: `Curriculum_vitae-${nomSafeCV}.pdf`,
            path: cvRenamedPath
          },
          {
            filename: `Lettre_Motivation-${nomSafeCV}.pdf`,
            path: lmPdfPath
          }
        ];

        const result = await sendEmail(entreprise.email, subject, messageContenu, attachments, config.email, appPassword);

        if (result.success) {
          sent++;
          console.log(`Email envoyé avec succès à ${entreprise.nom_entreprise} (${entreprise.email})`);
          const index = entreprises.findIndex(e => e.id === entreprise.id);
          if (index > -1) {
            entreprises[index].statut = STATUT_CANDIDATURE.ENVOYE;
            entreprises[index].date_envoi = new Date().toISOString();
          }
        } else {
          failed++;
          console.error(`Erreur pour ${entreprise.nom_entreprise}: ${result.error}`);
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
    
    // Nettoyer les fichiers renommés du dossier tmp
    try {
      const files = fs.readdirSync(tmpDir);
      files.forEach(file => {
        if ((file.startsWith('Curriculum_vitae-') || file.startsWith('Lettre_Motivation-')) && file.endsWith('.pdf')) {
          fs.unlinkSync(path.join(tmpDir, file));
        }
      });
    } catch (err) {
      console.error('Erreur nettoyage fichiers temporaires:', err);
    }
    
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
