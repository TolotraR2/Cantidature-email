import express from 'express';
import { readJSON, writeJSON } from '../models/fileDb.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration de multer pour les uploads de CV
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Renommer le fichier avec timestamp
    const timestamp = Date.now();
    cb(null, `cv_${timestamp}.pdf`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accepter seulement les PDF
    if (path.extname(file.originalname).toLowerCase() === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont acceptés'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Récupérer la configuration
router.get('/', (req, res) => {
  try {
    const config = readJSON('config.json');
    
    // Retourner la configuration par défaut si vide
    const defaultConfig = {
      nom_complet: 'RAHARIJAONA Tolojanahary',
      adresse: 'Lot 2850 Tanamborozano\nToamasina',
      email: 'raharijaonatolotra2@gmail.com',
      telephone: '+261 38 30 005 20',
      poste_recherche: 'Administrateur Système et Réseau',
      template_actif: '',
      delai_entre_envois: 5,
      max_envois_par_jour: 50,
      smtp_server: 'smtp.gmail.com',
      smtp_port: 587
    };

    const result = config.length > 0 ? config[0] : defaultConfig;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour la configuration
router.put('/', (req, res) => {
  try {
    const updates = req.body;
    
    // Récupérer la config actuelle ou en créer une
    let config = readJSON('config.json');
    
    if (config.length === 0) {
      config = [updates];
    } else {
      config[0] = { ...config[0], ...updates };
    }

    writeJSON('config.json', config);
    res.json(config[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Uploader le CV
router.post('/upload-cv', upload.single('cv'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }

    // Récupérer la config et mettre à jour le chemin du CV
    let config = readJSON('config.json');
    
    if (config.length === 0) {
      config = [{ cv_path: req.file.path }];
    } else {
      config[0].cv_path = req.file.path;
    }

    writeJSON('config.json', config);
    
    res.json({
      success: true,
      message: 'CV uploadé avec succès',
      cv_path: req.file.path,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
