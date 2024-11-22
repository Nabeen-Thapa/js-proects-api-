import Joi from 'joi';

// Define validation schema
const userValidation = Joi.object({
    name: Joi.string().min(3).required(),
    fullName: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    age: Joi.number().integer().min(10).max(120).required(), 
    dateOfBirth: Joi.date().optional(),
    profileImage: Joi.string().allow(null, '').optional(),
    gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
    status: Joi.string()
    .valid("unverified", "active", "blocked") // Match the enum values
    .default("active") // Optional: Default to "active"
    .optional(),
    resetPasswordExpires: Joi.date().optional(), // Add this line
});

export default userValidation;
