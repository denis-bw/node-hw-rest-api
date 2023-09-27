import Contact from '../models/contacts.js';
import { ctrlWrapper } from "../decorators/index.js";
import { httpError } from "../helpers/index.js";


const listContacts = async (req, res) => {
    const { _id: owner } = req.user;
    
    const {page = 1, limit = 3, favorite} = req.query;
    const skip = (page - 1) * limit;
    const filter = favorite ? { owner, favorite } : { owner };
    const allContacts = await Contact.find(filter, "-createdAt -updatedAt", {
        skip,
        limit,
        favorite,
    }).populate("owner", "name email subscription");

  res.json(allContacts);
};

const getContactById = async (req, res) => {
    const { contactId } = req.params;
    const { _id: owner } = req.user;
 
    const result = await Contact.findById(contactId);
   
    if (result?.owner.toString() !== owner.toString()) {
        throw httpError(404, `Contact with id=${contactId} not found`);
    }
    if (!result) {
        throw httpError(404, `Contact with id=${contactId} not found`);
    }

    res.json(result);
};

const addContact = async (req, res) => {
  const { _id: owner } = req.user;
   
  const newContacts = await Contact.create({ ...req.body, owner });
  res.status(201).json(newContacts);
};

const updateContact = async (req, res) => {
    const { contactId } = req.params;
    const { _id: owner } = req.user;

    const resultUpdate = await Contact.findOneAndUpdate(
      {_id: contactId, owner,},
      req.body,
      { new: true }
    );
    
    console.log(owner)
    if (!resultUpdate) {
        throw httpError(404, `Contact with id=${contactId} not found`);
    }

    res.json(resultUpdate);
};

const updateStatusContact = async (req, res) => {
    const { contactId } = req.params;
    const { _id: owner } = req.user;

    
    const resultUpdate = await Contact.findOneAndUpdate({_id: contactId, owner,}, req.body);

    if (!resultUpdate) {
        throw httpError(404, `Contact with id=${contactId} not found`);
    }

    res.status(200).json(resultUpdate);
}

const removeContact = async (req, res) => {
    const { contactId } = req.params;
    const { _id: owner } = req.user;


    const resultDelete = await Contact.findOneAndDelete({_id: contactId, owner,});
    
    if (!resultDelete) {
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
