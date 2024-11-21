import express from 'express';
import { createAssignJob, deleteAssignJob, getAssignJobById, getAssignJobs, updateAssignJob } from '../controllers/AssignJobController.js';


const router = express.Router();

router.post('/', createAssignJob);
router.get('/single', getAssignJobById);
router.get('/', getAssignJobs);
router.delete('/', deleteAssignJob);
export default router;
