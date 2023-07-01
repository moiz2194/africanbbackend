const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
  },
  images: [Object],
},{timestamps:true});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
