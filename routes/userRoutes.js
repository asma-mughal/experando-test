import express from 'express';
import { registerUser, loginUser, updateUserProfile, getUserData, registerOAuth, deleteUser, getAllUsers, getUsersByType, deleteAllUsers } from '../controllers/UserController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/register', registerUser);
router.post('/registerOauth', registerOAuth);
router.post('/login', loginUser);
router.put('/:userId', authMiddleware, updateUserProfile);
router.get('/', authMiddleware, getUserData); //password admin : 12345678
router.get('/all', getAllUsers);
router.delete('/:id', deleteUser)
router.get('/userType/:userType', getUsersByType)
router.delete('/', deleteAllUsers)
export default router;
