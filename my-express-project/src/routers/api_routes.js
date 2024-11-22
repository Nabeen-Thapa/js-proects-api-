import express from 'express';
import registerRouter from '../controllers/userRegister.js';
import loginRouter from '../controllers/login_route.js';
import cloudImgRoute from '../controllers/cloud_img_upload.js';
import homeRute from '../controllers/home_route.js';
import logoutRouter from '../controllers/logout_route.js';
import getNewAccessToken from '../controllers/get_new_accress_token.js';
import forgetPassword from '../controllers/forget_password.js';
import changePassword from '../controllers/change_password.js';
import viewRadisData from '../controllers/view_radis_data.js';
import addBlog from '../controllers/add_blog.js';
import deleteBLog from '../controllers/delete_blog.js';
import viewBlog from '../controllers/view_blog.js';
import sessionCheckRouter from '../controllers/session_check.js';
import updateUser from '../controllers/update_user.js';
import updatePost from '../controllers/update_post.js';

const apiRouter = express.Router();

// Combine all routes here
apiRouter.use(registerRouter);
apiRouter.use(loginRouter);
apiRouter.use(cloudImgRoute);
apiRouter.use(homeRute);
apiRouter.use(logoutRouter);
apiRouter.use(getNewAccessToken);
apiRouter.use(forgetPassword);
apiRouter.use(changePassword);
apiRouter.use(viewRadisData);
apiRouter.use(addBlog);
apiRouter.use(deleteBLog);
apiRouter.use(viewBlog);
apiRouter.use(sessionCheckRouter);
apiRouter.use(updateUser);
apiRouter.use(updatePost);

export default apiRouter;
