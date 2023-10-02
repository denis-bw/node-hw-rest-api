import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import 'dotenv/config'
import User from "../models/user.js";
import gravatar from "gravatar";
import path from "path";
import fs from "fs/promises"
import Jimp from "jimp";

import { httpError } from "../helpers/index.js";

import { ctrlWrapper } from "../decorators/index.js";

const { JWT_SECRET } = process.env;

const avatarPath = path.resolve("public", "avatars")

const signup = async (req, res) => {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (user) {
        throw httpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const unsecureUrl = gravatar.url(email, {protocol: 'http', s: '100'});
    const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL: unsecureUrl }); 
 
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
    console.log(req.user)
    const newPath = path.join(avatarPath, filename)

    
    await fs.rename(oldPath, newPath)
    const avatar = path.join("public", "avatars", filename)
    console.log(avatar)
  
     const img = await  Jimp.read(avatar)
        img.resize(250,250)
        img.write(`public/avatars/${filename}`)
    

    const resultUpdate = await User.findOneAndUpdate(_id, {avatarURL: `/avatars/${filename}`});
    res.status(200).json({
        message: "ok",
        avatarURL: resultUpdate.avatarURL,
    })
}

export default {
    signup: ctrlWrapper(signup),
    signin: ctrlWrapper(signin),
    getCurrent: ctrlWrapper(getCurrent),
    signout: ctrlWrapper(signout),
    updateAvatar: ctrlWrapper(updateAvatar)
}