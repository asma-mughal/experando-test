import express from 'express';
import { createService, deleteService, getAllServices, updateService } from '../controllers/ServiceController.js';


const router = express.Router();
router.post('/', createService);
router.get('/', getAllServices);
router.put('/', updateService);
router.delete('/', deleteService);

export default router;