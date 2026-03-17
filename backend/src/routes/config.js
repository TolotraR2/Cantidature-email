import express from 'express';
import { readJSON, writeJSON } from '../models/fileDb.js';

const router = express.Router();

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

export default router;
