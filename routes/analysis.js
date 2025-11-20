import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateLacticAcidAnalysis } from '../middleware/validation.js';
import { analyzeLacticAcid, updateAnalysis, getAnalysisHistory } from '../controllers/analysisController.js';
import Analysis from '../models/analysisSchema.js';

const router = Router();

router.use(authMiddleware);

// get analysis page 
router.get('/', (req, res) => {
    res.render('new-analysis'); 
});

// Create analysis for new patient after submit
router.post('/', validateLacticAcidAnalysis, analyzeLacticAcid);

// Render analysis history ?? results maybe? store in another collection with parent reference to actual analysis
router.get('/history', getAnalysisHistory);

router.post('/:analysisId/update', validateLacticAcidAnalysis, updateAnalysis);

router.get('/:analysisId/update', async (req, res) => {
    console.log("Get update analysis page called -> " + req.params.analysisId);
  const analysis = await Analysis.findById(req.params.analysisId)
    .populate('patientId');

  res.render('new-analysis', {
    isUpdate: true,
    analysisId: analysis._id,
    patient: analysis.patientId,
    analysis
  });
});


export default router;
