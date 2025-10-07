import express from 'express';
import { createRating, deleteRating, getRatings, deleteAllRatings } from '../controllers/RatingController.js';
import authMiddleware from '../middleware/authMiddleware.js';


const router = express.Router();

// POST: Create a new rating

router.get('/getRatings',authMiddleware, getRatings);
router.post('/',authMiddleware, createRating);
router.delete('/',authMiddleware, deleteRating)
router.delete('/all',authMiddleware, deleteAllRatings)
export default router;
