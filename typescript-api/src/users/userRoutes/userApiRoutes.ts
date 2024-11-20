import express from 'express';
import userRegister from '../controllers/user-register';

const apiUserRouter = express.Router();

// Combine all routes here
apiUserRouter.use(userRegister);


export default apiUserRouter;
