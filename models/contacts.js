import {Schema, model} from "mongoose";
import Joi from "joi";
import { handleSaveError, runValidateAtUpdate } from "./hooks.js";

const contactShema = new Schema({
  name: {
    type: String,
    required: [true, 'Set name for contact'],
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
}, {versionKey: false, timestamps: true});

contactShema.post("save", handleSaveError);

contactShema.pre("findOneAndUpdate", runValidateAtUpdate);

contactShema.post("findOneAndUpdate", handleSaveError);

export const addContactSchema = Joi.object({
  name: Joi.string().required()
    .messages({ "any.required": "Missing required name field" }),
  email: Joi.string().required()
    .messages({ "any.required": "Missing required email field" }),
  phone: Joi.string().required()
    .messages({ "any.required": "Missing required phone field" }),
});

export const updateContactSchema= Joi.object({
  name: Joi.string()
    .messages({ "any.required": "Missing required name field" }),
  email: Joi.string()
    .messages({ "any.required": "Missing required email field" }),
  phone: Joi.string()
    .messages({ "any.required": "Missing required phone field" }),
  favorite: Joi.boolean()
    .messages({ "any.required": "Missing required favorite field" }),
});

export const updateFavoriteContactSchema= Joi.object({

  favorite: Joi.boolean().required()
    .messages({ "any.required": "missing field favorite" }),
});

const Contact = model("contact", contactShema)

export default Contact;
