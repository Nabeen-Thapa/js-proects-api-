import express from 'express';
import userRegister from '../controllers/user-register';
import userLogin from '../controllers/user-login';
const apiUserRouter = express.Router();

// Combine all routes here
apiUserRouter.use(userRegister);
apiUserRouter.use(userLogin);

export default apiUserRouter;
