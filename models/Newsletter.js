const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const NewsletterSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  website: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: {
    type: [{}],
    required: true
  }
},{timestamps:true});

const Newsletter = mongoose.model('Newsletter', NewsletterSchema);

module.exports = Newsletter;
