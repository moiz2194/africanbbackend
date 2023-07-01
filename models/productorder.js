const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const thisSchema = new Schema({
    price:{
        type: Number,
        required:true
    },
    return:{
        type: Date,
    },
    deliverytime:{
        type: Date,
    },
    status:{
      type:String,
      default:"active"
    },
    secondstatus:{
        type:String, 
    },
    deliveryaddress: {
        type:String,
        default:null
    },
    trackingid: {
        type:String,
        default:null
    },
    trackingname: {
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
        default:"product"
    }
}, { timestamps: true });

const Newsletter = mongoose.model('productorder', thisSchema);

module.exports = Newsletter;
