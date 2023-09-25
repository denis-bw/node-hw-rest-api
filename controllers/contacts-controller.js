import Contact from '../models/contacts.js';
import { ctrlWrapper } from "../decorators/index.js";
import { httpError } from "../helpers/index.js";


const listContacts = async (req, res) => {
    const {_id: owner} = req.user;
    const {page = 1, limit = 10} = req.query;
    const skip = (page - 1) * limit;
    const contacts = await Contact.find({owner}, "-createdAt -updatedAt", {skip, limit})
        .populate("owner", "name email");
    res.json(contacts);
};

const getContactById = async (req, res) => {
    const { contactId } = req.params;
    const result = await Contact.findById(contactId);

    if (!result) {
        throw httpError(404, `Contact with id=${contactId} not found`);
    }

    res.json(result);
};

const addContact = async (req, res) => {
  const result = await Contact.create(req.body);
  res.status(201).json(result);
};

const updateContact = async (req, res) => {
    const { contactId } = req.params;
    const result = await Contact.findByIdAndUpdate(contactId, req.body);
    if (!result) {
        throw httpError(404, `Contact with id=${contactId} not found`);
    }

    res.json(result);
};

const updateStatusContact = async (req, res) => {
    const { contactId } = req.params;
   
    const result = await Contact.findByIdAndUpdate(contactId, req.body);
    if (!result) {
        throw httpError(404, `Contact with id=${contactId} not found`);
    }

    res.status(200).json(result);
}

const removeContact = async (req, res) => {
  const { contactId } = req.params;
    const result = await Contact.findByIdAndDelete(contactId);
    if (!result) {
        throw httpError(404, `Contact with id=${contactId} not found`);
    }

    res.json({
        message: "Delete success"
    })
};


export default  {
  listContacts: ctrlWrapper(listContacts),
  getContactById: ctrlWrapper(getContactById),
  removeContact: ctrlWrapper(removeContact),
  addContact: ctrlWrapper(addContact),
  updateContact: ctrlWrapper(updateContact),  
  updateStatusContact: ctrlWrapper(updateStatusContact)
}
