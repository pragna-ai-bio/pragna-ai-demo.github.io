import Analysis from '../models/Analysis.js';
import { enhancedLacticAcidPrediction } from '../utils/mlModel.js';
import { createPatientRecord, updatePatientRecord } from './patientController.js';

export async function analyzeLacticAcid(req, res) {
  try {
    const startTime = Date.now();
    const { patientId, patientName, patientAge, patientGender, molecularReadings, analysisId } = req.body;

    if (patientId) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot create new analysis for an existing patient. Use the update route instead.'
      });
    }

    // CREATE NEW PATIENT
    const patient = await createPatientRecord({
      name: patientName,
      age: patientAge,
      gender: patientGender,
      userId: req.user.id
    });

    // Extract molecular values
    const molecularValues = [
      molecularReadings?.carbonylStretch ?? analysis.molecularReadings.carbonylStretch,
      molecularReadings?.methylDeformation ?? molecularReadings.methylDeformation,
      molecularReadings?.carbonOxygenStretch ?? molecularReadings.carbonOxygenStretch,
      molecularReadings?.hydroxylStretch ?? molecularReadings.hydroxylStretch
    ];

    // AI analysis
    const cancerProbability = enhancedLacticAcidPrediction(molecularValues);
    const riskLevel = cancerProbability > 0.8 ? 'high' : cancerProbability >= 0.5 ? 'medium' : 'low';
    const confidenceScore = calculateConfidenceScore(molecularValues, cancerProbability);

    // CREATE NEW ANALYSIS
    const analysis = new Analysis({
      patientId: patient._id,
      molecularReadings: {
        carbonylStretch: { value: molecularReadings.carbonylStretch },
        methylDeformation: { value: molecularReadings.methylDeformation },
        carbonOxygenStretch: { value: molecularReadings.carbonOxygenStretch },
        hydroxylStretch: { value: molecularReadings.hydroxylStretch }
      },
      analysisResults: {
        cancerProbability,
        riskLevel,
        confidenceScore,
        molecularReasons: generateMolecularReasons(molecularValues, cancerProbability),
        recommendations: generateRecommendations(cancerProbability, riskLevel),
        aiReasoning: generateAIReasoning(molecularValues, cancerProbability)
      },
      createdBy: req.user.id
    });

    await analysis.save();

    res.status(200).json({
      status: 'success',
      message: 'Lactic acid analysis completed',
      analysisId: analysis._id,
      results: {
        cancerProbability: Math.round(cancerProbability * 100),
        riskLevel,
        confidenceScore: Math.round(confidenceScore * 100)
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export async function updateAnalysis(req, res) {
  try {
    const { analysisId } = req.params;
    const { molecularReadings } = req.body;

    const analysis = await Analysis.findById(analysisId);
    if (!analysis) throw new Error('Analysis not found');

    const molecularValues = [
      molecularReadings.carbonylStretch,
      molecularReadings.methylDeformation,
      molecularReadings.carbonOxygenStretch,
      molecularReadings.hydroxylStretch
    ];

    const cancerProbability = enhancedLacticAcidPrediction(molecularValues);
    const riskLevel = cancerProbability > 0.8 ? 'high' : cancerProbability >= 0.5 ? 'medium' : 'low';
    const confidenceScore = calculateConfidenceScore(molecularValues, cancerProbability);

    analysis.molecularReadings = {
      carbonylStretch: { value: molecularReadings.carbonylStretch },
      methylDeformation: { value: molecularReadings.methylDeformation },
      carbonOxygenStretch: { value: molecularReadings.carbonOxygenStretch },
      hydroxylStretch: { value: molecularReadings.hydroxylStretch }
    };
    analysis.analysisResults = {
      cancerProbability,
      riskLevel,
      confidenceScore,
      molecularReasons: generateMolecularReasons(molecularValues, cancerProbability),
      recommendations: generateRecommendations(cancerProbability, riskLevel),
      aiReasoning: generateAIReasoning(molecularValues, cancerProbability)
    };

    await analysis.save();

    res.status(200).json({ status: 'success', message: 'Analysis updated successfully' });

  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
}

// Get analysis history
export async function getAnalysisHistory(req, res) {
  try {
    const analyses = await Analysis.find({ createdBy: req.user.id })
      .populate('patientId', 'name age gender researchId')
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({
      status: 'success',
      data: analyses
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch analysis history'
    });
  }
}

function calculateConfidenceScore(values, probability) {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const dataQuality = Math.max(0.5, 1 - (variance / 2));
  return Math.min(0.95, 0.7 + (probability * 0.2) + (dataQuality * 0.1));
}

function generateMolecularReasons(values, probability) {
  const reasons = [];
  if (probability > 0.7) {
    reasons.push("Elevated carbonyl stretch suggests altered lactic acid metabolism");
    reasons.push("Methyl group deformation patterns indicate potential Warburg effect");
  } else if (probability > 0.4) {
    reasons.push("Moderate changes in lactic acid molecular vibrations detected");
  } else {
    reasons.push("Lactic acid molecular vibrations within normal ranges");
  }
  return reasons;
}

function generateRecommendations(probability, riskLevel) {
  const recommendations = [];
  if (riskLevel === 'high') {
    recommendations.push("Consider comprehensive metabolic panel testing");
    recommendations.push("LDH levels assessment recommended");
  } else if (riskLevel === 'medium') {
    recommendations.push("Routine metabolic screening recommended");
  } else {
    recommendations.push("Maintain routine health checkups");
  }
  recommendations.push("REMINDER: This is research data only - consult healthcare professionals");
  return recommendations;
}

function generateAIReasoning(values, probability) {
  if (probability > 0.7) {
    return "The AI has detected significant alterations in lactic acid molecular vibration patterns consistent with cancer metabolism.";
  } else if (probability > 0.4) {
    return "Moderate changes in lactic acid molecular vibrations observed. Further investigation recommended.";
  } else {
    return "Lactic acid molecular vibrations appear within normal metabolic ranges.";
  }
}




// import Analysis from '../models/Analysis.js';
// import patientSchema from '../models/patientSchema.js';
// import { enhancedLacticAcidPrediction } from '../utils/mlModel.js';

// // Analyze lactic acid molecular vibrations
// export async function analyzeLacticAcid(req, res) {
//   try {
//     const startTime = Date.now();
//     const {
//       patientName,
//       patientAge,
//       patientGender,
//       molecularReadings
//     } = req.body;
//     // Research disclaimer
//     const researchDisclaimer = "🔬 THIS ANALYSIS IS FOR RESEARCH PURPOSES ONLY - NOT FOR MEDICAL DIAGNOSIS";
//     // Create patientSchema
//     const patient = new patientSchema({
//       name: patientName,
//       age: patientAge,
//       gender: patientGender,
//       createdBy: req.user.id
//     });
//     await patient.save();
//     // Extract molecular value
//     const molecularValues = [
//       molecularReadings.carbonylStretch,
//       molecularReadings.methylDeformation,
//       molecularReadings.carbonOxygenStretch,
//       molecularReadings.hydroxylStretch
//     ];
//     // AI analysis
//     const cancerProbability = enhancedLacticAcidPrediction(molecularValues);
//     // Determine risk level
//     let riskLevel = 'low';
//     if (cancerProbability > 0.8) riskLevel = 'high';
//     else if (cancerProbability >= 0.5) riskLevel = 'medium';
//     // Calculate confidence
//     const confidenceScore = calculateConfidenceScore(molecularValues, cancerProbability);
//     // Create analysis record
//     const analysis = new Analysis({
//       patientId: patient._id,
//       molecularReadings: {
//         carbonylStretch: { value: molecularReadings.carbonylStretch },
//         methylDeformation: { value: molecularReadings.methylDeformation },
//         carbonOxygenStretch: { value: molecularReadings.carbonOxygenStretch },
//         hydroxylStretch: { value: molecularReadings.hydroxylStretch }
//       },
//       analysisResults: {
//         cancerProbability,
//         riskLevel,
//         confidenceScore,
//         molecularReasons: generateMolecularReasons(molecularValues, cancerProbability),
//         recommendations: generateRecommendations(cancerProbability, riskLevel),
//         aiReasoning: generateAIReasoning(molecularValues, cancerProbability)
//       },
//       createdBy: req.user.id
//     });
//     await analysis.save();
//     // Return response
//     res.status(200).json({
//       status: 'success',
//       message: 'Lactic acid analysis completed',
//       disclaimer: researchDisclaimer,
//       analysisId: analysis._id,
//       results: {
//         cancerProbability: Math.round(cancerProbability * 100),
//         riskLevel,
//         confidenceScore: Math.round(confidenceScore * 100),
//         molecularReasons: analysis.analysisResults.molecularReasons,
//         recommendations: analysis.analysisResults.recommendations,
//         technicalDetails: {
//           modelVersion: 'lactic-acid-v1.0',
//           analysisDuration: Date.now() - startTime
//         }
//       }
//     });
//   } catch (error) {
//     console.error('Analysis error:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Analysis failed'
//     });
//   }
// }

// export async function getAnalysisHistory(req, res) {
//   try {
//     const analyses = await Analysis.find({ createdBy: req.user.id })
//       .populate('patientId', 'name age gender researchId')
//       .sort({ createdAt: -1 })
//       .limit(10);
//     res.status(200).json({
//       status: 'success',
//       data: analyses
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch analysis history'
//     });
//   }
// }

// function calculateConfidenceScore(values, probability) {
//   const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
//   const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
//   const dataQuality = Math.max(0.5, 1 - (variance / 2));
//   return Math.min(0.95, 0.7 + (probability * 0.2) + (dataQuality * 0.1));
// }

// function generateMolecularReasons(values, probability) {
//   const reasons = [];
//   if (probability > 0.7) {
//     reasons.push("Elevated carbonyl stretch suggests altered lactic acid metabolism");
//     reasons.push("Methyl group deformation patterns indicate potential Warburg effect");
//   } else if (probability > 0.4) {
//     reasons.push("Moderate changes in lactic acid molecular vibrations detected");
//   } else {
//     reasons.push("Lactic acid molecular vibrations within normal ranges");
//   }
//   return reasons;
// }

// function generateRecommendations(probability, riskLevel) {
//   const recommendations = [];
//   if (riskLevel === 'high') {
//     recommendations.push("Consider comprehensive metabolic panel testing");
//     recommendations.push("LDH levels assessment recommended");
//   } else if (riskLevel === 'medium') {
//     recommendations.push("Routine metabolic screening recommended");
//   } else {
//     recommendations.push("Maintain routine health checkups");
//   }
//   recommendations.push("REMINDER: This is research data only - consult healthcare professionals");
//   return recommendations;
// }

// function generateAIReasoning(values, probability) {
//   if (probability > 0.7) {
//     return "The AI has detected significant alterations in lactic acid molecular vibration patterns consistent with cancer metabolism.";
//   } else if (probability > 0.4) {
//     return "Moderate changes in lactic acid molecular vibrations observed. Further investigation recommended.";
//   } else {
//     return "Lactic acid molecular vibrations appear within normal metabolic ranges.";
//   }
// }

// //new analysis view
// export async function renderNewAnalysisPage(req, res) {
//   try {
//     const patient = await patientSchema.findById(req.params.patientId);

//     if (!patient) return res.status(404).send("Patient not found");

//     // analysis=null makes PUG show editable fields + "Run Analysis" button
//     res.render("analysis", { patient, analysis: null });

//   } catch (error) {
//     console.error("Render new analysis error:", error);
//     res.status(500).send("Failed to load page");
//   }
// }

// //existing analysis view
// export async function renderAnalysisPage(req, res) {
//   try {
//     const analysis = await Analysis.findById(req.params.analysisId).populate("patientId");

//     if (!analysis) return res.status(404).send("Analysis not found");

//     res.render("analysis", {
//       patient: analysis.patientId,
//       analysis
//     });

//   } catch (error) {
//     console.error("Render analysis error:", error);
//     res.status(500).send("Failed to load analysis");
//   }
// }

// export async function updateAnalysis(req, res) {
//   const cancerProbability = enhancedLacticAcidPrediction(values);

//   const confidenceScore = calculateConfidenceScore(values, cancerProbability);

//   const reasons = generateMolecularReasons(values, cancerProbability);

//   const recs = generateRecommendations(cancerProbability, riskLevel);

//   const ai = generateAIReasoning(values, cancerProbability);
// }

