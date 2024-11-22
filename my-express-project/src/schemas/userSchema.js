import Joi from 'joi';

// Define validation schema
const userSchema = Joi.object({
    name: Joi.string().min(3).required(),
    fullName: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(4).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    age: Joi.number().integer().min(10).max(120).required(), 
    dateOfBirth: Joi.date().optional(),
    profileImage: Joi.string().optional(),
    gender: Joi.string().valid('Male', 'Female', 'Other').optional()
});

export default userSchema;
