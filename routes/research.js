import { Router } from 'express';
const router = Router();
import authMiddleware from '../middleware/authMiddleware.js';
import { getResearchData } from '../controllers/researchController.js';

router.use(authMiddleware);

router.get('/', getResearchData);  

export default router;