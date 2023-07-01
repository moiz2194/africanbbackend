const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  emailVerificationToken: {
    type: String,
  },
  emailVerificationTokenExpires: {
    type: Date,
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: "active"
  },
  seller: {
    type: Boolean,
    default: false
  },
  signupseller: {
    type: Boolean,
    default: false
  },
  profileimage: {
    public_id:{
      type:String
    },
    url:{
      type:String
    }
  },
  coverimage:{
    public_id:{
      type:String
    },
    url:{
      type:String
    }
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business"
  }

}, { timestamps: true });

module.exports = mongoose.model('Users', userSchema);
