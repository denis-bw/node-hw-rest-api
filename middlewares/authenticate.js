import jwt from "jsonwebtoken";
import 'dotenv/config'
import User from "../models/user.js";

import { httpError } from "../helpers/index.js";


const {JWT_SECRET} = process.env;

const authenticate = async(req, res, next) =>{
    const {authorization = ""} = req.headers;
    const [bearer, token] = authorization.split(" ");
    if(bearer !== "Bearer") {
       throw httpError(401);
    }

    try {
        const {id} = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(id);
        if(!user || !user.token) {
            throw httpError(401);
        }
        req.user = user;
        next();
    }
    catch {
        throw httpError(401);
    }

}

export default authenticate