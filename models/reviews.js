const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const thisSchema = new Schema({
    comment: {
        type: String,
        required: true
    },
    rating:{
        type:Number,
        required:true
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business"
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users"
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "order"
    },
    gig: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "gig"
    }
}, { timestamps: true });

const Newsletter = mongoose.model('reviews', thisSchema);

module.exports = Newsletter;
