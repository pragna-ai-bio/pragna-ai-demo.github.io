import Analysis from '../models/analysisSchema.js';

export async function getResearchData(req, res) {
    try {
        const analyses = await Analysis.find()
            .populate('patientId', 'name age gender researchId')
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            status: 'success',
            data: analyses
        });
    } catch (error) {
        console.error('Fetch research data error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch research data'
        });
    }
}