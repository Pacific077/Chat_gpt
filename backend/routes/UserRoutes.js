import express from "express"
import { CheckAuth, LoginUser, LogoutUser, UserProfile, registerUser } from "../controllers/UserControllers.js";
import IsAuthenticated from "../middlewares/isAuthenticated.js";
const UserRouter = express.Router();

UserRouter.post('/register',registerUser);
UserRouter.post('/login',LoginUser);
UserRouter.post('/logout',LogoutUser);
UserRouter.get('/profile',IsAuthenticated,UserProfile);
UserRouter.get('/auth/check',IsAuthenticated,CheckAuth);

export default UserRouter;