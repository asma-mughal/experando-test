import express from 'express';
import { createPaymentIntent, deleteAllPaymentIntents } from '../controllers/PaymentController.js';

const router = express.Router();

router.post('/', createPaymentIntent);
router.delete('/', deleteAllPaymentIntents);
export default router;
