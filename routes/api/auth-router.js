import express from "express";

import authController from "../../controllers/auth-controller.js";

import * as userSchemas from "../../models/user.js";

import {validateBody} from "../../decorators/index.js";

import {authenticate} from "../../middlewares/index.js";

const authRouter = express.Router();

const userSignupValidate = validateBody(userSchemas.userSignupSchema);
const userSigninValidate = validateBody(userSchemas.userSigninSchema);

authRouter.post("/users/register", userSignupValidate, authController.signup);

authRouter.post("/users/login", userSigninValidate, authController.signin);

authRouter.get("/users/current", authenticate, authController.getCurrent);

authRouter.post("/users/logout", authenticate, authController.signout);

export default authRouter;