import express from 'express';
import userRegister from '../controllers/user-register';
import userLogin from '../controllers/user-login';
import userLogout from '../controllers/user-logout';
import changeUserPassowrd from '../controllers/change-password';
import forgetPassword from '../controllers/forget-password';
const apiUserRouter = express.Router();

// Combine all routes here
apiUserRouter.use(userRegister);
apiUserRouter.use(userLogin);
apiUserRouter.use(userLogout);
apiUserRouter.use(changeUserPassowrd);
apiUserRouter.use(forgetPassword);


export default apiUserRouter;
