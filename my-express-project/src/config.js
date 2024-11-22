import mongoose from "mongoose";
import AutoIncrementFactory from 'mongoose-sequence';
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from 'redis';
const redisClient = createClient();

// Connect to the Redis server
redisClient.connect().catch((error) => {
    console.error('Redis connection error:', error);
});

// Connect to MongoDB
const connectURL = process.env.mongourl || "mongodb://localhost:27017/user_ExpressDB";
mongoose.connect(connectURL
//     , {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }
).then(() => {
    console.log('Connected successfully to MongoDB');
}).catch((error) => {
    console.log('DB connection error:', error.message);
});

// Initialize AutoIncrement using the mongoose connection
const AutoIncrement = AutoIncrementFactory(mongoose.connection);

// Define user schema
const userSchema = new mongoose.Schema({ 
    userId: { type: Number, unique: true }, // Ensure userId is here for auto-increment
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, 
    age: { type: Number, required: true },
    dateOfBirth: { type: Date, default: null },
    profileImage: { type: String, default: null },
    gender: { type: String, required: true },
    resetPasswordExpires: { type: Date },
    status: { type: String, enum: ['unverified', 'active', 'blocked'], default: 'active' }
});

// Use mongoose-sequence to auto-increment userId
userSchema.plugin(AutoIncrement, { inc_field: 'userId' });

const collection = mongoose.model('user_details', userSchema);

//to store user tokens
const userTokenSchema = new mongoose.Schema({
    accessToken: { type: String, required: true},
    refreshToken: { type: String, required: true },
    userId :{type: Number, require : true},
    userEmail: { type: String, required: true, unique: true },
    status: { type: String, enum: ['unverified', 'active', 'blocked'], default: 'active' },
});
userTokenSchema.plugin(AutoIncrement, { inc_field: 'tokenId' });
const collectionToken = mongoose.model('user_tokens', userTokenSchema);

//user post collsction
const userPostSchema = new mongoose.Schema({
    userEmail: { type: String, required: true},
    postTitle: { type: String, required: true },
    postDescription :{type: String, require : true},
    status: { type: String, enum: ['unverified', 'active', 'blocked'], default: 'active' },
});
userPostSchema.plugin(AutoIncrement, { inc_field: 'postId' });
const collectionPost = mongoose.model('user_blogs', userPostSchema);




export { collection, collectionToken, redisClient, collectionPost };
