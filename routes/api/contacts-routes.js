import express from "express";

import contactsController from "../../controllers/contacts-controller.js";
import * as contactSchemas from "../../models/contacts.js";
import {validateBody} from "../../decorators/index.js";
import {authenticate, isValidId} from "../../middlewares/index.js";

const contactAddValidate = validateBody(contactSchemas.addContactSchema);
const contactUpdateFavoriteValidate = validateBody(contactSchemas.updateFavoriteContactSchema);
const contactUpdateValidate = validateBody(contactSchemas.updateContactSchema)

const contactRouter = express.Router()


moviesRouter.use(authenticate);

contactRouter.get("/", contactsController.listContacts);

contactRouter.get("/:contactId", isValidId, contactsController.getContactById);

contactRouter.post("/", contactAddValidate, contactsController.addContact);

contactRouter.put("/:contactId", isValidId, contactUpdateValidate, contactsController.updateContact);

contactRouter.patch("/:contactId/favorite", isValidId, contactUpdateFavoriteValidate, contactsController.updateStatusContact);

contactRouter.delete("/:contactId", isValidId, contactsController.removeContact);

export default contactRouter;

