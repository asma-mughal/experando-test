import express from 'express';
import { createAssignJob, deleteAllAssignJobs, deleteAssignJob, getAssignJobById, getAssignJobs, updateAssignJob } from '../controllers/AssignJobController.js';


const router = express.Router();

router.post('/', createAssignJob);
router.get('/single', getAssignJobById);
router.get('/', getAssignJobs);
router.delete('/', deleteAssignJob);
router.delete('/all', deleteAllAssignJobs);
export default router;
