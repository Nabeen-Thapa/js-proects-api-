import express from 'express';
import userRegister from '../controllers/user-register';
import userLogin from '../controllers/user-login';
import userLogout from '../controllers/user-logout';
const apiUserRouter = express.Router();

// Combine all routes here
apiUserRouter.use(userRegister);
apiUserRouter.use(userLogin);
apiUserRouter.use(userLogout);

export default apiUserRouter;
