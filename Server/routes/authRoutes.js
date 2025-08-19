import express from 'express'
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp, sendVerifyOtp, VerifyEmailAccount } from '../controllers/authController.js';
import userAuth from '../middleware/authUser.js';
const authRouter =express.Router();

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post('/send-verify-otp',userAuth,sendVerifyOtp);
authRouter.post('/verify-account',userAuth,VerifyEmailAccount);
authRouter.get('/is-auth',isAuthenticated);
authRouter.post('/send-reset-otp',sendResetOtp);
authRouter.post('/reset-password',resetPassword);
 
export default authRouter;