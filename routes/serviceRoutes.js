import express from 'express';
import { createService, deleteAllServices, deleteService, getAllServices, updateService } from '../controllers/ServiceController.js';


const router = express.Router();
router.post('/', createService);
router.get('/', getAllServices);
router.put('/:serviceId', updateService);
router.delete('/:serviceId', deleteService);
router.delete('/all', deleteAllServices);
export default router;