import express from 'express';
import { registerUser, loginUser, updateUserProfile, getUserData, registerOAuth, deleteUser, getAllUsers } from '../controllers/UserController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/register', registerUser);
router.post('/registerOauth', registerOAuth);
router.post('/login', loginUser);
router.put('/:userId', authMiddleware, updateUserProfile);
router.get('/', authMiddleware, getUserData);
router.get('/all', getAllUsers);
router.delete('/:id', deleteUser)
export default router;
