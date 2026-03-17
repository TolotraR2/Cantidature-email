import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON, appendJSON, updateJSON, deleteJSON } from '../models/fileDb.js';

const router = express.Router();

// Récupérer tous les templates
router.get('/', (req, res) => {
  try {
    const templates = readJSON('templates.json');
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un template
router.post('/', (req, res) => {
  try {
    const { nom, description, contenu } = req.body;

    if (!nom || !contenu) {
      return res.status(400).json({ error: 'Nom et contenu sont requis' });
    }

    const newTemplate = {
      id: uuidv4(),
      nom,
      description: description || '',
      contenu,
      date_creation: new Date().toISOString()
    };

    appendJSON('templates.json', newTemplate);
    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un template
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const templates = readJSON('templates.json');
    const template = templates.find(t => t.id === id);

    if (!template) {
      return res.status(404).json({ error: 'Template non trouvé' });
    }

    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un template
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = updateJSON('templates.json', id, updates);
    
    if (!updated) {
      return res.status(404).json({ error: 'Template non trouvé' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un template
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    deleteJSON('templates.json', id);
    res.json({ message: 'Template supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
