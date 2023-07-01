const express = require('express');
const router = express.Router();
const asyncerror = require('../middlewares/catchasyncerror.js');
const ErrorHandler = require('../middlewares/errorhandler');
const User = require('../models/Users.js')
const Message = require('../models/messages.js')
const Chat = require('../models/chat.js')
const { AuthenticateUser, AuthenticateSeller } = require('../middlewares/AuthenticateUser');


router.post('/allmsgs', AuthenticateUser, async (req, res, next) => {
  try {
    function getUserWithDifferentId(users, givenId) {
      if (users[0].toString() === givenId.toString()) {
        return users[1];
      } else {
        return users[0];
      }
    }

    const { chatId, limit } = req.body;
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .skip(limit) // Skip the already loaded messages
      .limit(15) // Load the next 15 messages
      .populate('sender', 'name profileimage email')
      .populate('chat');

    for (const obj of messages) {
      let oldReceiver = getUserWithDifferentId(obj.chat.users, req.id);
      let receiver = await User.findById(oldReceiver).select('name email _id profileimage mobile');
      obj.receiver = receiver;
    }
    const remainingMessagesCount = await Message.find({ chat: chatId }).countDocuments();
    const allmsgs = remainingMessagesCount <= limit + 15;
    res.status(201).json({ success: true, messages, allmsgs });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/sendmsg', AuthenticateUser, asyncerror(async (req, res, next) => {
  const { content, chatId, type } = req.body;

  if (!content || !chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.id,
    content: content,
    chat: chatId,
    type
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name profileimage");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name profileimage email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message._id });

    res.status(201).json({ success: true, message });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
}))


module.exports = router