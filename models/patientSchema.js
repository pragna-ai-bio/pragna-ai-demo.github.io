import { Schema, model } from 'mongoose';

const patientSchema = new Schema(
  {
    researchId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      minlength: 2,
    },
    age: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: 0,
      max: 120,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Patient gender is required'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  },
  { timestamps: true }
);

patientSchema.method("toJSON", function() {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

patientSchema.pre('save', function (next) {
  if (!this.researchId) {
    this.researchId =
      `RES${Date.now()}${Math.random().toString(36).substring(2, 7)}`.toUpperCase(); // what is this? 
  }
  next();
});

export default model('Patient', patientSchema);  