import Patient from '../models/patientSchema.js';
//We create patient when /analyze is called in analysisController.js

export async function createPatientRecord({ name, age, gender, userId }) {
    const patient = new Patient({
        name,
        age,
        gender,
        createdBy: userId
    });
    await patient.save();
    return patient;
}

export async function updatePatientRecord(patientId, { name, age, gender }) {
    const patient = await Patient.findById(patientId);
    if (!patient) throw new Error('Patient not found');

    patient.name = name ?? patient.name;
    patient.age = age ?? patient.age;
    patient.gender = gender ?? patient.gender;

    await patient.save();
    return patient;
}


//Create a new patient DO WEE NEED THIS FUNCTION?
export async function createPatient(req, res) {
    try {
        const { name, age, gender } = req.body;
        const patient = await createPatientRecord({
            name,
            age,
            gender,
            userId: req.user.id
        });

        res.status(201).json({
            status: 'success',
            message: 'Patient created successfully',
            data: patient
        });
    } catch (error) {
        console.error('Patient creation error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create patient'
        });
    }
}

// Update patient details DO WEE NEED THIS FUNCTION?
export async function updatePatient(req, res) {
    try {
        const { name, age, gender } = req.body;
        const patient = await updatePatientRecord(req.params.id, { name, age, gender });

        res.status(200).json({
            status: 'success',
            message: 'Patient updated successfully',
            data: patient
        });
    } catch (error) {
        console.error('Patient update error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}

// Get all patients for logged-in user
export async function getPatients(req, res, noJson = false) {
  try {
    const patients = await Patient.find({ createdBy: req.user.id }).sort({ createdAt: -1 });

    // If controller is called from a Pug route → return raw data
    if (noJson) return patients;

    // Otherwise return JSON (API)
    res.status(200).json({
      status: 'success',
      data: patients
    });

  } catch (error) {
    console.error('Fetch patients error:', error);

    if (noJson) return null;

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch patients'
    });
  }
}

// Get patient by ID (when selected)
export async function getPatientById(req, res, noJson = false) {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      if (noJson) return null;
      return res.status(404).json({
        status: 'error',
        message: 'Patient not found'
      });
    }

    if (noJson) return patient;

    res.status(200).json({
      status: 'success',
      data: patient
    });

  } catch (error) {
    console.error('Fetch patient error:', error);

    if (!noJson) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch patient'
      });
    }

    return null;
  }
}




// import Patient from '../models/patientSchema.js';
// //We  create patient when /analyze is called in analysisController.js

// //Create a new patient
// export async function createPatient(req, res) {
//     try {
//         const { name, age, gender } = req.body;
//         const patient = new Patient({
//             name,
//             age,
//             gender,
//             createdBy: req.user.id
//         });
//         await patient.save();

//         res.status(201).json({
//             status: 'success',
//             message: 'Patient created successfully',
//             data: patient
//         });
//     } catch (error) {
//         console.error('Patient creation error:', error);
//         res.status(500).json({
//             status: 'error',
//             message: 'Failed to create patient'
//         });
//     }
// }

// // Get all patients for logged-in user
// export async function getPatients(req, res, noJson = false) {
//   try {
//     const patients = await Patient.find({ createdBy: req.user.id }).sort({ createdAt: -1 });

//     // If controller is called from a Pug route → return raw data
//     if (noJson) return patients;

//     // Otherwise return JSON (API)
//     res.status(200).json({
//       status: 'success',
//       data: patients
//     });

//   } catch (error) {
//     console.error('Fetch patients error:', error);

//     if (noJson) return null;

//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch patients'
//     });
//   }
// }

// // Get patient by ID (when selected)
// export async function getPatientById(req, res, noJson = false) {
//   try {
//     const patient = await Patient.findById(req.params.id);

//     if (!patient) {
//       if (noJson) return null;
//       return res.status(404).json({
//         status: 'error',
//         message: 'Patient not found'
//       });
//     }

//     if (noJson) return patient;

//     res.status(200).json({
//       status: 'success',
//       data: patient
//     });

//   } catch (error) {
//     console.error('Fetch patient error:', error);

//     if (!noJson) {
//       res.status(500).json({
//         status: 'error',
//         message: 'Failed to fetch patient'
//       });
//     }

//     return null;
//   }
// }

