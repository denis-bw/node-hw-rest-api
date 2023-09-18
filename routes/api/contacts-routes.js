import express from "express";
import Joi from "joi";
import contactService from "../../models/contacts.js";
import { httpError } from "../../helpers/index.js";

const router = express.Router()

const addSchema = Joi.object({
  name: Joi.string().required()
    .messages({ "any.required": "Missing required name field" }),
  email: Joi.string().required()
    .messages({ "any.required": "Missing required email field" }),
  phone: Joi.string().required()
    .messages({ "any.required": "Missing required phone field" }),
});

const addSchemaUpd = Joi.object({
  name: Joi.string()
    .messages({ "any.required": "Missing required name field" }),
  email: Joi.string()
    .messages({ "any.required": "Missing required email field" }),
  phone: Joi.string()
    .messages({ "any.required": "Missing required phone field" }),
});

router.get('/', async (req, res, next) => {
  try {
     const result = await contactService.listContacts()
     res.json(result)
  } catch (error) {
      next(error)
  }
})

router.get('/:contactId', async (req, res, next) => {
    try {
       console.log(req.params)
        const {contactId} = req.params;
        const result = await contactService.getContactById(contactId);
     if (!result) {
       throw httpError(404, `Movie with id=${contactId} not found`);
     }
        res.json(result);
    }
    catch(error) {
        next(error);
    }
})

router.post('/', async (req, res, next) => {
  try {
      const { error } = addSchema.validate(req.body);
     
      if (error) {
            throw httpError(400, error.message);
        }
      const result = await contactService.addContact(req.body);
       
        res.status(201).json(result);
    }
  catch (error) {
      
        next(error);
    }
})

router.delete('/:contactId', async (req, res, next) => {
   try {
        const {contactId} = req.params;
       const result = await contactService.removeContact(contactId);
       
        if(!result) {
            throw httpError(404, `Movie with id=${contactId} not found`);
        }
        res.json({
            message: "Delete success"
        })
    }
    catch(error) {
        next(error);
    }
})

router.put('/:contactId', async (req, res, next) => {
     try {
        const {error} = addSchemaUpd.validate(req.body);
        if(error) {
            throw httpError(400, error.message);
        }
        const {contactId} = req.params;
        const result = await contactService.updateContact(contactId, req.body);
        if(!result) {
            throw httpError(404, `Movie with id=${contactId} not found`);
        }

        res.json(result);
    }
    catch(error) {
        next(error);
    }
})

export default router

