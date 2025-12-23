import {Router} from 'express';
import 
{
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword
} from '../controllers/user.controller.js';
import { isLoggedIn } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const routers =Router();

routers.post('/register',
    upload.single(
      "avatar"        
      ),register);
routers.post('/login',login);
routers.get('/logout',isLoggedIn,logout);
routers.get('/profile',isLoggedIn,getProfile);
routers.post("forgot-password", forgotPassword);
routers.post("reset-password/:resetToken", resetPassword);



export default routers;