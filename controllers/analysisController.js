import Analysis from '../models/analysisSchema.js';
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
      Number(molecularReadings?.carbonylStretch),
      Number(molecularReadings?.methylDeformation),
      Number(molecularReadings?.carbonOxygenStretch),
      Number(molecularReadings?.hydroxylStretch)
    ];


    // AI analysis
    const cancerProbability = enhancedLacticAcidPrediction(molecularValues);
    const riskLevel = cancerProbability > 0.8 ? 'high' : cancerProbability >= 0.5 ? 'medium' : 'low';
    const confidenceScore = calculateConfidenceScore(molecularValues, cancerProbability);

    // CREATE NEW ANALYSIS 
    // TODO: ML MODEL INTEGRATION 
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

    return res.redirect(`/analysis/${analysis._id}`);

  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// UPDATE ANALYSIS + UPDATE PATIENT (same form, same page)
export async function updateAnalysis(req, res) {
  try {
    console.log("Update analysis called");
    const { analysisId } = req.params;
    const { patientName, patientAge, patientGender, molecularReadings } = req.body;

    const analysis = await Analysis.findById(analysisId);
    if (!analysis) throw new Error('Analysis not found');

    const updatedPatient = await updatePatientRecord(analysis.patientId, {
      name: patientName,
      age: patientAge,
      gender: patientGender
    });

    const molecularValues = [
      Number(molecularReadings?.carbonylStretch),
      Number(molecularReadings?.methylDeformation),
      Number(molecularReadings?.carbonOxygenStretch),
      Number(molecularReadings?.hydroxylStretch)
    ];


    const cancerProbability = enhancedLacticAcidPrediction(molecularValues);
    const riskLevel =
      cancerProbability > 0.8 ? 'high' :
      cancerProbability >= 0.5 ? 'medium' : 'low';

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

    return res.redirect(`/patients/${analysis.patientId}`);

  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: err.message });
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

