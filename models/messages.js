const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    content: { type: String, trim: true },
    type: { type: String},
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    reciever:{
      name:{
       type:String
      },
      _id:{
       type:String
      },
      email:{
       type:String
      },
      mobile:{
       type:String
      },
      profileimage:{
        public_id:{
          type:String
        },
        url:{
          type:String
        }
      }
     }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;