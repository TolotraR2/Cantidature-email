import express from 'express';
import { readJSON } from '../models/fileDb.js';

const router = express.Router();

// Récupérer l'historique complet
router.get('/', (req, res) => {
  try {
    const historique = readJSON('historique.json');
    const entreprises = readJSON('entreprises.json');

    // Enrichir avec les infos de l'entreprise
    const enriched = historique.map(h => {
      const ent = entreprises.find(e => e.id === h.entreprise_id);
      return {
        ...h,
        entreprise_nom: ent?.nom_entreprise || 'N/A'
      };
    });

    res.json(enriched.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer l'historique d'une entreprise
router.get('/entreprise/:entrepriseId', (req, res) => {
  try {
    const { entrepriseId } = req.params;
    let historique = readJSON('historique.json');
    
    historique = historique.filter(h => h.entreprise_id === entrepriseId);
    res.json(historique.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
