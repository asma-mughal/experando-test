import express from 'express';
import { createRating, deleteRating, getRatings } from '../controllers/RatingController.js';


const router = express.Router();

// POST: Create a new rating

router.get('/getRatings', getRatings);
router.post('/', createRating);
router.delete('/', deleteRating)

export default router;
