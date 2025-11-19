import { Schema, model } from 'mongoose';

const analysisSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      unique: true
    },

    molecularReadings: {
      carbonylStretch: {
        value: { type: Number, required: true },
        unit: { type: String, default: 'MHz' }
      },
      methylDeformation: {
        value: { type: Number, required: true },
        unit: { type: String, default: 'MHz' }
      },
      carbonOxygenStretch: {
        value: { type: Number, required: true },
        unit: { type: String, default: 'MHz' }
      },
      hydroxylStretch: {
        value: { type: Number, required: true },
        unit: { type: String, default: 'MHz' }
      }
    },

    analysisResults: {
      cancerProbability: {
        type: Number,
        required: true,
        min: 0,
        max: 1
      },
      riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true
      },
      confidenceScore: {
        type: Number,
        required: true
      },
      molecularReasons: [String],
      recommendations: [String],
      aiReasoning: String
    },

    mlModelVersion: {
      type: String,
      default: 'lactic-acid-v1.0'
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

analysisSchema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

// analysisSchema.statics.createOne = function (data) {
//   try {
//     return this.model('Analysis').create(data);
//   } catch (error) {
//     throw new Error(`Error finding analyses: ${error.message}`);
//   }
// };

// analysisSchema.statics.findMany = function (query = {}) {
//   try {
//     return this.model('Analysis').find(query);
//   } catch (error) {
//     throw new Error(`Error finding analyses: ${error.message}`);
//   }
// };

// analysisSchema.statics.findOneRecord = function (criteria) {
//   try { 
//     return this.model('Analysis').findOne(criteria); }
//   catch (error) {
//     throw new Error(`Error finding analyses: ${error.message}`);
//   }
// };

// analysisSchema.statics.findByIdRecord = function (id) {
//   try { 
//     return this.model('Analysis').findById(id); }
//   catch (error) {
//     throw new Error(`Error finding analyses: ${error.message}`);
//   }
// };

export default model('Analysis', analysisSchema);
