import express from 'express';
import { createPaymentIntent } from '../controllers/PaymentController.js';

const router = express.Router();

router.post('/', createPaymentIntent);

export default router;
