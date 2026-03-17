import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON, updateJSON, deleteJSON, appendJSON } from '../models/fileDb.js';
import { STATUT_CANDIDATURE } from '../constants.js';

export const getAllEntreprises = (req, res) => {
  try {
    let entreprises = readJSON('entreprises.json');
    
    // Filtrage
    const { statut, type, recherche, tri } = req.query;
    
    if (statut) {
      entreprises = entreprises.filter(e => e.statut === statut);
    }
    
    if (type) {
      entreprises = entreprises.filter(e => e.type_candidature === type);
    }
    
    if (recherche) {
      const search = recherche.toLowerCase();
      entreprises = entreprises.filter(e => 
        e.nom_entreprise.toLowerCase().includes(search) ||
        e.ville.toLowerCase().includes(search) ||
        e.email.toLowerCase().includes(search)
      );
    }

    // Tri
    if (tri) {
      const [field, order] = tri.split(':');
      entreprises.sort((a, b) => {
        if (order === 'desc') {
          return b[field] > a[field] ? 1 : -1;
        }
        return a[field] > b[field] ? 1 : -1;
      });
    } else {
      entreprises.sort((a, b) => new Date(b.date_ajout) - new Date(a.date_ajout));
    }

    res.json({
      total: entreprises.length,
      data: entreprises
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createEntreprise = (req, res) => {
  try {
    const { nom_entreprise, email, ville, type_candidature, tags } = req.body;

    // Validation
    if (!nom_entreprise || !email || !ville || !type_candidature) {
      return res.status(400).json({ error: 'Tous les champs requis doivent être remplis' });
    }

    const newEntreprise = {
      id: uuidv4(),
      nom_entreprise,
      email,
      ville,
      type_candidature,
      tags: tags || [],
      statut: STATUT_CANDIDATURE.NON_ENVOYE,
      date_ajout: new Date().toISOString(),
      date_envoi: null,
      erreur: null
    };

    appendJSON('entreprises.json', newEntreprise);
    
    res.status(201).json(newEntreprise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEntreprise = (req, res) => {
  try {
    const { id } = req.params;
    const entreprises = readJSON('entreprises.json');
    const entreprise = entreprises.find(e => e.id === id);

    if (!entreprise) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }

    res.json(entreprise);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateEntreprise = (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = updateJSON('entreprises.json', id, updates);
    
    if (!updated) {
      return res.status(404).json({ error: 'Entreprise non trouvée' });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteEntreprise = (req, res) => {
  try {
    const { id } = req.params;
    
    deleteJSON('entreprises.json', id);
    res.json({ message: 'Entreprise supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStatistics = (req, res) => {
  try {
    const entreprises = readJSON('entreprises.json');
    
    const stats = {
      total: entreprises.length,
      envoyes: entreprises.filter(e => e.statut === STATUT_CANDIDATURE.ENVOYE).length,
      non_envoyes: entreprises.filter(e => e.statut === STATUT_CANDIDATURE.NON_ENVOYE).length,
      echecs: entreprises.filter(e => e.statut === STATUT_CANDIDATURE.ECHEC).length,
      recrutement: entreprises.filter(e => e.type_candidature === 'recrutement').length,
      spontanee: entreprises.filter(e => e.type_candidature === 'spontanee').length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  getAllEntreprises,
  createEntreprise,
  getEntreprise,
  updateEntreprise,
  deleteEntreprise,
  getStatistics
};
