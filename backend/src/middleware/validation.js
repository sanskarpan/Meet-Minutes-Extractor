const Joi = require('joi');

const meetingSchema = Joi.object({
    text: Joi.string().min(10).max(50000).when('file', {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required()
    }),
    format: Joi.string().valid('json').default('json'),
    extractionOptions: Joi.object({
        includeSummary: Joi.boolean().default(true),
        includeDecisions: Joi.boolean().default(true),
        includeActionItems: Joi.boolean().default(true),
        maxSummaryLength: Joi.number().integer().min(1).max(10).default(3)
    }).default({})
});

const validateMeetingInput = (req, res, next) => {
    // Prepare validation data
    const validationData = {
        text: req.body.text,
        format: req.body.format,
        extractionOptions: req.body.extractionOptions
    };

    if (req.file) {
        validationData.file = req.file;
    }

    const { error, value } = meetingSchema.validate(validationData, {
        abortEarly: false,
        allowUnknown: false
    });

    if (error) {
        const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
        }));

    return res.status(400).json({
        error: 'Validation failed',
        details: errors,
        hint: 'Provide either text in request body or upload a .txt/.md file'
        });
    }

    req.validatedData = value;
    next();
};

module.exports = {
    validateMeetingInput
};