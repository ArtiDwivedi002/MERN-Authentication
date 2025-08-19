import express from 'express'
import userAuth from '../middleware/authUser.js';
import { getUserData } from '../controllers/userController.js';
const userRoutes=express.Router();
userRoutes.get('/data',userAuth,getUserData);
export default userRoutes;