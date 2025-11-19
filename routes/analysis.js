import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { validateLacticAcidAnalysis } from '../middleware/validation.js';
import { analyzeLacticAcid, updateAnalysis, getAnalysisHistory } from '../controllers/analysisController.js';
import Analysis from '../models/Analysis.js';

const router = Router();

router.use(authMiddleware);

// Create analysis for new patient (only if patient is new)
router.post('/', validateLacticAcidAnalysis, analyzeLacticAcid);

router.get('/', async (req, res) => {
    res.render('analysis', {    
        patient: Analysis.patientId,
        Analysis
    });
});

// Update existing analysis
router.post('/:analysisId/update', validateLacticAcidAnalysis, updateAnalysis);

// Render analysis history (optional)
router.get('/history', getAnalysisHistory);

// Render analysis page for editing/viewing
router.get('/:analysisId', async (req, res) => {
    const analysis = await Analysis.findById(req.params.analysisId).populate('patientId');
    if (!analysis) return res.status(404).send("Analysis not found");

    res.render('analysis', {    
        patient: analysis.patientId,
        analysis
    });
});

export default router;
