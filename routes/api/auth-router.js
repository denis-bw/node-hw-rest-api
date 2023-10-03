import express from "express";

import authController from "../../controllers/auth-controller.js";

import * as userSchemas from "../../models/user.js";

import {validateBody} from "../../decorators/index.js";

import {authenticate, upload} from "../../middlewares/index.js";

const authRouter = express.Router();

const userSignupValidate = validateBody(userSchemas.userSignupSchema);
const userSigninValidate = validateBody(userSchemas.userSigninSchema);
const userEmailValidate = validateBody(userSchemas.userEmailSchema)

authRouter.post("/users/register", userSignupValidate, authController.signup);

authRouter.patch("/users/avatars", upload.single("avatarURL"), authenticate, authController.updateAvatar);

authRouter.post("/users/login", userSigninValidate, authController.signin);

authRouter.get("/users/current", authenticate, authController.getCurrent);

authRouter.post("/users/logout", authenticate, authController.signout);

authRouter.get("/verify/:verificationToken", authController.verify);

authRouter.post("/verify",userEmailValidate, authController.resendVerifyEmail);

export default authRouter;