import express from 'express';
import bcrypt from 'bcrypt';
import path from 'path';
import userSchema from '../schemas/userSchema.js'; 
import { collection } from '../config.js';
import { upload } from '../middleware/image_upload.js';
import { sendInternalServerError, sendInvalidRequestError, sendRegistrationSuccess } from '../helper_functions/helpers.js';
const app = express();
const registerRouter = express.Router();
const saltRounds = 10;



registerRouter.post('/register', upload.single('profileImage'), async (req, res) => {
   
    console.log('Request body:', req.body); 
    console.log('Uploaded file:', req.file);
    try {
        // Validate input against schema
        const { error } = userSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        // Prepare user data
        const userData = {
           
            name: req.body.name,
            fullName: req.body.fullName,
            email: req.body.email,
            username: req.body.username,
            password: hashedPassword,
            phone: req.body.phone,
            age: req.body.age,
            dateOfBirth: req.body.dateOfBirth,
            profileImage: req.file ? req.file.path : null,
            gender: req.body.gender,
        };

        // Check for existing user
        const existingUser = await collection.findOne({
            $or: [
                
                { email: req.body.email },
                { phone: req.body.phone },
                { username: req.body.username }
            ]
        });

        if (existingUser) {
            return sendInvalidRequestError(res);
        }

        // Insert new user
         await collection.create(userData);
         //return sendRegistrationSuccess(res);
        return res.status(201).json({ message: 'Registration successful' }); 
    } catch (err) {
        console.error('Registration error:', err);
        return sendInternalServerError(res);
    }
});


export default registerRouter;
