import express from 'express';
import { addBusiness, deleteBusiness, updateBusiness, getBusiness } from '../controllers/BunsiessController.js';
const router = express.Router();

router.post('/add', addBusiness);
router.delete('/:id', deleteBusiness);
router.get('/', getBusiness)
router.put('/:id', updateBusiness);

export default router;