const Question = require('../models/Community');

// Get all questions
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific question by ID
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search for questions by keyword
// exports.searchQuestions = async (req, res) => {
//   try {
//     const { keyword } = req.query;
//     const questions = await Question.find({
//       $or: [
//         { question: { $regex: keyword, $options: 'i' } },
//         { answer: { $regex: keyword, $options: 'i' } },
//       ],
//     });
//     res.status(200).json(questions);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

exports.searchQuestions = async (req, res) => {
  try {
    const { keyword } = req.query;
    let questions;
    if (keyword) {
      questions = await Question.find({
        $or: [
          { question: { $regex: keyword, $options: 'i' } },
          { answer: { $regex: keyword, $options: 'i' } },
        ],
      }).populate("user").sort("-createdAt");
    } else {
      questions = await Question.find({}).populate("user").sort("-createdAt");
    }
    res.status(200).json({questions});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Create a new question
exports.createQuestion = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const newQuestion = new Question({
      user: req.id,
      question,
      answer,
      images: req.files,
    });
    var savedQuestion = await newQuestion.save();
    res.status(201).json({ question: savedQuestion, message: 'Your response added successfully', });
  } catch (error) {
    res.status(500).json({
      error: error.message, message: 'Operation failed ',

    });
  }
};

// Update an existing question
exports.updateQuestion = async (req, res) => {
  try {
    const { question, answer, images } = req.body;
    const questionToUpdate = await Question.findById(req.params.id);
    if (!questionToUpdate) {
      return res.status(404).json({ message: 'Question not found' });
    }
    questionToUpdate.question = question || questionToUpdate.question;
    questionToUpdate.answer = answer || questionToUpdate.answer;
    questionToUpdate.images = images || questionToUpdate.images;
    const updatedQuestion = await questionToUpdate.save();
    res.status(200).json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an existing question
exports.deleteQuestion = async (req, res) => {
  try {
    const questionToDelete = await Question.findById(req.params.id);
    if (!questionToDelete) {
      return res.status(404).json({ message: 'Question not found' });
    }
    await questionToDelete.remove();
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
