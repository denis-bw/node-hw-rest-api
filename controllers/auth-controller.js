import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import 'dotenv/config'
import User from "../models/user.js";
import gravatar from "gravatar";
import path from "path";
import fs from "fs/promises"
import Jimp from "jimp";
import { nanoid } from "nanoid";

import { httpError, sendEmail } from "../helpers/index.js";

import { ctrlWrapper } from "../decorators/index.js";


const { JWT_SECRET, BASE_URL } = process.env;

const avatarPath = path.resolve("public", "avatars")

const signup = async (req, res) => {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (user) {
        throw httpError(409, "Email in use");
    }
    
    const hashPassword = await bcrypt.hash(password, 10);
    const verificationToken = nanoid();
    
    const unsecureUrl = gravatar.url(email, {protocol: 'http', s: '100'});
    const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL: unsecureUrl, verificationToken: verificationToken, }); 
    

    const verifyEmail = {
        to: email,
        subject: "verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationToken}">Click to verify email</a>`
    }

    await sendEmail(verifyEmail)

    res.status(201).json({
        username: newUser.username,
        email: newUser.email,
    })
}

const signin = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw httpError(401, "Email or password is wrong");
    }

    if (!user.verify) {
        throw httpError(401, "Email not verify");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw httpError(401, "Email or password is wrong"); 
    }

    const { _id: id } = user;

    const payload = {
        id,
    }

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
    await User.findByIdAndUpdate(id, { token });
    
    res.json({
        token,
    })
}

const getCurrent = (req, res) => {
    const { name, email } = req.user;

    res.json({
        name,
        email,
    })
}

const signout = async (req, res) => {
    const { _id } = req.user;
    
    await User.findByIdAndUpdate(_id, { token: "" });

    res.json({
        message: "Signout success"
    })
}

const updateAvatar = async (req, res) => {
    const { _id } = req.user;
    
    const { path: oldPath, filename } = req.file;
    
    const newPath = path.join(avatarPath, filename)

    
    await fs.rename(oldPath, newPath)
    const avatar = path.join("public", "avatars", filename)
    
  
     const img = await  Jimp.read(avatar)
        img.resize(250,250)
        img.write(`public/avatars/${filename}`)
    

    const resultUpdate = await User.findOneAndUpdate(_id, {avatarURL: `/avatars/${filename}`});
    res.status(200).json({
        message: "ok",
        avatarURL: resultUpdate.avatarURL,
    })
}

const verify = async (req, res) => { 
    const { verificationToken } = req.params;
    console.log(verificationToken, "aa")
    const user = await User.findOne({ verificationToken: verificationToken}) 
    console.log(user, "user")
    if (!user) {
        throw httpError(404);
    }

    await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: "" })
    
    res.json({
        message: "email verify success"
    })
}

const resendVerifyEmail = async (req, res) => { 
    const { email } = req.body;
    const user = await User.findOne({ email })
    
    if (!user) {
        throw httpError(404, "email not found")
    }
    if (user.verify) {
        throw httpError(400, 'email alredy verify')
    }

    const verifyEmail = {
        to: email,
        subject: "verify email",
        html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationToken}">Click to verify email</a>`
    }

    await sendEmail(verifyEmail);


    res.json({
        message: "signout success"
    })
}

export default {
    signup: ctrlWrapper(signup),
    signin: ctrlWrapper(signin),
    getCurrent: ctrlWrapper(getCurrent),
    signout: ctrlWrapper(signout),
    updateAvatar: ctrlWrapper(updateAvatar),
    verify: ctrlWrapper(verify),
    resendVerifyEmail: ctrlWrapper( resendVerifyEmail)
}