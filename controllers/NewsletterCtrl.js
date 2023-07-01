const Newsletter = require("../models/Newsletter")


// CREATE a new newsletter




const createNewsletter = async (req, res) => {
    try {
      const { name, author, website, description, images } = req.body;
  
      const newsletter = new Newsletter({
        name,
        author,
        website,
        description,
        images:req.files
      });
  
      await newsletter.save();
  
      res.status(201).json({newsletter,message:"Your News Added Successfully"});
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  // READ all newsletters
  const getAllNewsletters = async (req, res) => {
    try {
      const news = await Newsletter.find({}).sort('-updatedAt');
      res.json({news});
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  // READ a specific newsletter by ID
  const getNewsletterById = async (req, res) => {
    try {
      const newsletter = await Newsletter.findById(req.params.id);
      if (!newsletter) {
        return res.status(404).json({ message: 'Newsletter not found' });
      }
      res.json(newsletter);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  // UPDATE a specific newsletter by ID
  const updateNewsletterById = async (req, res) => {
    try {
      const { name, author, website, description, images } = req.body;
  
      const newsletter = await Newsletter.findByIdAndUpdate(
        req.params.id,
        {
          name,
          author,
          website,
          description,
          images
        },
        { new: true }
      );
  
      if (!newsletter) {
        return res.status(404).json({ message: 'Newsletter not found' });
      }
  
      res.json(newsletter);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };
  
  // DELETE a specific newsletter by ID
  const deleteNewsletterById = async (req, res) => {
    try {
      const newsletter = await Newsletter.findByIdAndDelete(req.params.id);
      if (!newsletter) {
        return res.status(404).json({ message: 'Newsletter not found' });
      }
      res.json({ message: 'Newsletter deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  
  module.exports = {
    createNewsletter,
    getAllNewsletters,
    getNewsletterById,
    updateNewsletterById,
    deleteNewsletterById
  };
  