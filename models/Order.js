const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const thisSchema = new Schema({
    price:{
        type: Number,
        required:true
    },
    deliverytime:{
        type: Date,
    },
    deliverydays:{
        type: Number,
        required:true
    },
    status:{
      type:String,
      default:"active"
    },
    secondstatus:{
        type:String, 
    },
    requirementfiles: [
        {
            public_id: {
                type: String,
            },
            url: {
                type: String,
            },
            extension:{
                type:String
            },
            name:{
                type:String 
            }
        }
    ],
    deliveryfiles: [
        {
            public_id: {
                type: String,
            },
            url: {
                type: String,
            },
            extension:{
                type:String
            },
            name:{
                type:String 
            }
        }
    ],
    deliverytext: {
        type:String,
        default:null
    },
    requirementtext: {
        type:String,
        default:null
    },
    business:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Business",
        required:true
    },
    gig:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"gig",
        required:true
    },
    review:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"reviews"
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Users",
        required:true
    },
    startdate:{
      type:Date
    },
    completedate:{
      type:Date
    },
    latedelivery:{
      type:Boolean,
      default:false
    },
    requestcancel:{
      type:String,
      default:null
    },
    reason:{
      type:String,
      default:null
    },
    acceptcancel:{
      type:String,
      default:null
    },
    type:{
        type:String,
        default:"normal"
    }
}, { timestamps: true });

const Newsletter = mongoose.model('order', thisSchema);

module.exports = Newsletter;
