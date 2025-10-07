import express from 'express';
import { createService, deleteAllServices, deleteService, getAllServices, updateService } from '../controllers/ServiceController.js';
import authMiddleware from '../middleware/authMiddleware.js';


const router = express.Router();
router.post('/',authMiddleware, createService);
router.get('/',getAllServices);
router.put('/:serviceId', authMiddleware,  updateService);
router.delete('/:serviceId', authMiddleware, deleteService);
router.delete('/all',authMiddleware, deleteAllServices);
export default router;