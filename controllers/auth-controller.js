import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import 'dotenv/config'
import User from "../models/user.js";

import { httpError } from "../helpers/index.js";

import { ctrlWrapper } from "../decorators/index.js";

const { JWT_SECRET } = process.env;

const signup = async (req, res) => {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (user) {
        throw httpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ ...req.body, password: hashPassword }); 
 
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
    console.log(token,"token")
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

export default {
    signup: ctrlWrapper(signup),
    signin: ctrlWrapper(signin),
    getCurrent: ctrlWrapper(getCurrent),
    signout: ctrlWrapper(signout),
}