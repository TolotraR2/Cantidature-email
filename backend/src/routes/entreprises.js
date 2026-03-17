import express from 'express';
import * as entreprisesController from '../controllers/entreprisesController.js';

const router = express.Router();

// Routes CRUD
router.get('/', entreprisesController.getAllEntreprises);
router.post('/', entreprisesController.createEntreprise);
router.get('/stats', entreprisesController.getStatistics);
router.get('/:id', entreprisesController.getEntreprise);
router.put('/:id', entreprisesController.updateEntreprise);
router.delete('/:id', entreprisesController.deleteEntreprise);

export default router;
