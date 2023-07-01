const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
 users:[
    {
        type: Schema.Types.ObjectId,
        ref:"Users"
    }
 ],
 latestMessage: {
    type: Schema.Types.ObjectId,
    ref:"Message"
  },
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
    profileimage:{
        public_id:{
          type:String
        },
        url:{
          type:String
        }
      }
   },
  type:{
    type:String,
    default:"normal"
  }
},
{ timestamps: true });

const Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat