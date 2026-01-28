import Joi from 'joi';

// Joi schemas for validation
export const registerSchema = Joi.object({
    fullName: Joi.string().min(1).max(100).optional(),
    name: Joi.string().min(1).max(100).optional(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
}).or('fullName', 'name'); // At least one of fullName or name

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const firebaseAuthSchema = Joi.object({
    firebaseUID: Joi.string().required(),
    email: Joi.string().email().required(),
    name: Joi.string().min(1).max(100).optional()
});

export const createProblemSchema = Joi.object({
    topic: Joi.alternatives().try(
        Joi.string().min(1).max(100), // Topic name
        Joi.string().regex(/^[0-9a-fA-F]{24}$/) // MongoDB ObjectId
    ).required(),
    title: Joi.string().min(1).max(200).required(),
    difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').required(),
    description: Joi.string().max(1000).optional(),
    url: Joi.string().uri().optional(),
    tags: Joi.array().items(Joi.string()).optional()
});

export const problemIdSchema = Joi.object({
    id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
});

// Validation middleware function
export const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({ message: 'Validation error', errors });
        }
        next();
    };
};

// For params validation
export const validateParams = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.params, { abortEarly: false });
        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({ message: 'Validation error', errors });
        }
        next();
    };
};
