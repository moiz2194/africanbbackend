const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const businessSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  slogan: String,
  category: String,
  location: {
    type: {
      type: String,
    },
    coordinates: {
      type: [Number],
    }
  },
  ipaddress: [
    {
      type: String,
    }
  ],
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
  status:{
    type: String,
    default: "active"
  },
  membershipexpiredate: {
    type: Date,
  },
  membershippaid: {
    type: Boolean,
    default:false
  },
  description: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
  rank: {
    type: Number,
    default:1
},
}, { timestamps: true });

module.exports = mongoose.model('Business', businessSchema);
