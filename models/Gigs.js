const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const thisSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    website:{
        type: String
    },
    return:{
        type: Number,
        default:0
    },
    subcategory: {
        type: String,
        required: true

    },
    positive_tags: [
        {
            type: String,
        }
    ],
    description: {
        type: String,
    },
    clicks: {
        type: Number,
        default: 0
    },
    orders: {
        type: Number,
        default: 0
    },
    impressions: {
        type: Number,
        default: 0
    },
    rank: {
        type: Number,
        default: 1
    },
    reviews:[
         {
        type: mongoose.Schema.Types.ObjectId,
        ref: "reviews"
        }
    ],
    price: {
        type: Number,
        required: true
    },
    deliverytime: {
        type: Number,
        default: 1
    },
    images: [
        {
            public_id: {
                type: String,
            },
            url: {
                type: String,
            },
            position: {
                type: Number
            }
        }
    ],
    video: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        }
    },
    status: {
        type: String,
        default: "draft"
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business"
    }
}, { timestamps: true });

const Newsletter = mongoose.model('gig', thisSchema);

module.exports = Newsletter;
