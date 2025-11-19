import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { getPatients, getPatientById } from '../controllers/patientController.js';
import Analysis from '../models/Analysis.js';

const router = Router();
router.use(authMiddleware);

// Home screen: list of patients
router.get('/', async (req, res) => {
  const patients = await getPatients(req, res, true);
  res.render('home', { user: req.user, patients });
});

// View patient and their analysis
router.get('/:id', async (req, res) => {
  const patient = await getPatientById(req, res, true);
  if (!patient) return res.status(404).send("Not found");

  // Get analysis for this patient (at most 1)
  const analysis = await Analysis.findOne({ patientId: patient._id }).sort({ createdAt: -1 });

  // Pass analysis as a single object (or null)
  res.render('analysis', { patient, analysis });
});

export default router;


// import { Router } from 'express';
// const router = Router();
// import authMiddleware from '../middleware/authMiddleware.js';
// import { getPatients, getPatientById } from '../controllers/patientController.js';
// import Analysis from '../models/Analysis.js';

// router.use(authMiddleware);

// // Home screen
// router.get('/', async (req, res) => {
//   const patients = await getPatients(req, res, true);
//   res.render('home', { user: req.user, patients });
// });

// // View patient analyses
// router.get('/:id', async (req, res) => {
//   const patient = await getPatientById(req, res, true); // VIEW MODE
//   if (!patient) return res.status(404).send("Not found");

//   const analyses = await Analysis.find({ patientId: patient._id }).sort({ createdAt: -1 });

//   res.render('patient', { patient, analyses });
// });


// //router.post('/', createPatient);       
// //router.get('/', getPatients);         
// //router.get('/:id', getPatientById);    
// export default router;
