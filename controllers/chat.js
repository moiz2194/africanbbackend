const express = require('express');
const router = express.Router();
const asyncerror = require('../middlewares/catchasyncerror.js');
const ErrorHandler = require('../middlewares/errorhandler');
const User = require('../models/Users.js')
const Chat = require('../models/chat.js')
const { AuthenticateUser } = require('../middlewares/AuthenticateUser.js');


router.post('/accesschat', AuthenticateUser, asyncerror(async (req, res, next) => {

    const { userId } = req.body;

    if (!userId) {
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }

    var isChat = await Chat.find({
        $and: [
            { users: { $elemMatch: { $eq: req.id } } },
            { users: { $elemMatch: { $eq: userId } } },
        ],
    })
        .populate("users")
        .populate("latestMessage");

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email",
    });

    if (isChat.length > 0) {
        res.status(200).json({chat:isChat[0],newchat:false});
    } else {
        var chatData;
        if (req.body.type) {
            chatData = {
                users: [req.id, userId],
                type: req.body.type
            };
        } else {
            chatData = {
                users: [req.id, userId],
            };
        }
        try {
            const createdChat = await Chat.create(chatData);
            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
                "users"
            );

            res.status(200).json({chat:FullChat,newchat:true});
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
}))
router.get('/allchats', AuthenticateUser, asyncerror(async (req, res) => {
    function getUserWithDifferentId(users, givenId) {
        if (users[0]?._id.toString() === givenId.toString()) {
            return users[1];
        } else {
            return users[0];
        }
    }
    Chat.find({ users: { $elemMatch: { $eq: req.id } } })
        .populate("users", "name email profileimage")
        .populate("latestMessage")
        .sort({ updatedAt: -1 })
        .then(async (results) => {
            results = await User.populate(results, {
                path: "latestMessage.sender",
                select: "name profileimage email",
            });
            results.map(obj => {
                const reciever = getUserWithDifferentId(obj.users, req.id)
                obj.reciever = reciever;
            });

            res.status(200).send({ chats: results, success: true });
        });
}))

module.exports = router