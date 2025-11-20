import Joi from 'joi';  // import default

// Lactic Acid Analysis Validation Schema
export const lacticAcidAnalysisSchema = Joi.object({
    patientName: Joi.string().min(1).max(100).required(),
    patientAge: Joi.number().integer().min(1).max(120).required(),
    patientGender: Joi.string().valid('male', 'female', 'other').required(),
    molecularReadings: Joi.object({
        carbonylStretch: Joi.number().min(0).max(10).required(),
        methylDeformation: Joi.number().min(0).max(10).required(),
        carbonOxygenStretch: Joi.number().min(0).max(10).required(),
        hydroxylStretch: Joi.number().min(0).max(10).required()
    }).required()
});

// User Validation Schema
export const userSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(50).required()
});

// Middleware to validate request body
// export const validate = (schema) => {
//     return (req, res, next) => {
//         const { error } = schema.validate(req.body);
//         if (error) {
//             return res.status(400).json({
//                 status: 'error',
//                 message: 'Validation failed',
//                 errors: error.details.map(detail => detail.message)
//             });
//         }
//         next();
//     };
// };

export const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false });

        if (!error) return next();

        // Convert Joi errors → field: message format
        const fieldErrors = {};
        error.details.forEach(detail => {
            const field = detail.path.join("."); // e.g. "patientAge", "molecularReadings.carbonylStretch"
            fieldErrors[field] = detail.message;
        });

        // If JSON request, send JSON error
        if (req.xhr || req.headers.accept?.includes("application/json")) {
            return res.status(400).json({
                status: "error",
                message: "Validation failed",
                errors: fieldErrors
            });
        }

        // Otherwise re-render the form with errors
        return res.status(400).render("new-analysis", {
            isUpdate: false,
            analysis: req.body,
            fieldErrors
        });
    };
};


// Export middleware for specific schemas
export const validateLacticAcidAnalysis = validate(lacticAcidAnalysisSchema);
export const validateUser = validate(userSchema);