import express from 'express';
import { addBusiness, deleteBusiness, updateBusiness, getBusiness, deleteAllBusniess } from '../controllers/BunsiessController.js';
import authMiddleware from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/add', authMiddleware, addBusiness);
router.delete('/:id',authMiddleware, deleteBusiness);
router.get('/', getBusiness)
router.put('/:id',authMiddleware,  updateBusiness);
router.delete('/', authMiddleware, deleteAllBusniess);
export default router;