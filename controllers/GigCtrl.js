const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/Users');
const Gig = require('../models/Gigs');
const Review = require('../models/reviews.js');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const Order = require('../models/Order.js');
const asyncerror = require("../middlewares/catchasyncerror.js")
const { AuthenticateUser, AuthenticateSeller } = require('../middlewares/AuthenticateUser');
const ErrorHandler = require('../middlewares/errorhandler');
const ProductOrder = require('../models/productorder.js');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});


router.post('/create-draft', AuthenticateUser, AuthenticateSeller, asyncerror(async (req, res) => {
    req.body.business = req.user.business
    let gig;
    if (!req.body.id) {
        gig = await Gig.create(req.body);
    } else {
        const verifygig = await Gig.findById(req.body.id)
        if (verifygig.business.toString() !== req.user.business.toString()) {
            return next(new ErrorHandler("Unauthorzied", 404))
        }
        gig = await Gig.findByIdAndUpdate(req.body.id, req.body)
    }
    if (gig === null) {
        return next(new ErrorHandler("Gig Not found Plese go back and create gig again!", 404))
    }
    res.status(200).json({ success: true, gig });

}));
function isBase64URL(url) {
    // Base64 URL pattern
    const base64URLPattern = /^(data:image\/[a-zA-Z]+;base64,)/;
  
    return base64URLPattern.test(url);
  }
  function isBase64VideoURL(url) {
    // Base64 video URL pattern
    const base64VideoURLPattern = /^(data:video\/[a-zA-Z]+;base64,)/;
  
    return base64VideoURLPattern.test(url);
  }
  
router.post('/updategig', AuthenticateUser, AuthenticateSeller, asyncerror(async (req, res) => {
    req.body.business = req.user.business
    let gig;
    if (!req.body.id) {
        return next(new ErrorHandler("Please Select a valid gig!", 404))
    } else {
        const verifygig = await Gig.findById(req.body.id)
        if (verifygig.business.toString() !== req.user.business.toString()) {
            return next(new ErrorHandler("Unauthorzied", 404))
        }
        if (req.body.allselectedimages) {
            let imagesarr =[];
            for (const iterator of req.body.allselectedimages) {
              if (isBase64URL === null) {
                var result = await cloudinary.uploader.upload(iterator, {
                  folder: "gig images",
                  resource_type: "auto"
                });
                // Replace base64 iterator with the Cloudinary uploaded image details
                const uploadedImage = { public_id: result.public_id, url: result.url };
                const imageIndex = imagesarr.indexOf(iterator);
                imagesarr[imageIndex] = uploadedImage;
              }else{
                const imageIndex = imagesarr.indexOf(iterator);
                imagesarr[imageIndex] = iterator;
              }
            }
           
            req.body.images = imagesarr;
          }
          
        if (isBase64VideoURL(req.body.selectedvideo)) {
            var result = await cloudinary.uploader.upload(req.body.selectedvideo, {
                folder: "gig videos",
                resource_type: "auto"
            })
            req.body.video = { public_id: result.public_id, url: result.url }
        }
        gig = await Gig.findByIdAndUpdate(req.body.id, req.body)
    }
    res.status(200).json({ success: true, gig });

}));

router.post('/publish-gig', AuthenticateUser, AuthenticateSeller, asyncerror(async (req, res, next) => {
    let gig;
    if (!req.body.id) {
        return next(new ErrorHandler("Kindly Fill all of the previous fields!", 405))
    }
    else {
        const verifygig = await Gig.findById(req.body.id)
        if (verifygig.business.toString() !== req.user.business.toString()) {
            return next(new ErrorHandler("Unauthorzied", 404))
        }
        if (req.body.allselectedimages) {
            let imagesarr = [];
            for (const iterator of req.body.allselectedimages) {
                if (iterator !== null) {
                    var result = await cloudinary.uploader.upload(iterator, {
                        folder: "gig images",
                        resource_type: "auto"
                    })
                    imagesarr.push({ public_id: result.public_id, url: result.url })
                }
            }
            req.body.images = imagesarr
        } else {
            return next(new ErrorHandler("Make sure to add at least one image"))
        }
        if (req.body.selectedvideo) {
            var result = await cloudinary.uploader.upload(req.body.selectedvideo, {
                folder: "gig videos",
                resource_type: "auto"
            })
            req.body.video = { public_id: result.public_id, url: result.url }
        }
        req.body.status = "active"
        gig = await Gig.findByIdAndUpdate(req.body.id, req.body)

    }
    if (gig === null) {
        return next(new ErrorHandler("Gig Not found Plese go back and create gig again!"))
    }
    res.status(200).json({ success: true, gig });

}));
router.get('/mysinglegig', AuthenticateUser, AuthenticateSeller, asyncerror(async (req, res) => {
    const gig = await Gig.findById(req.query.id)
    res.status(200).json({ success: true, gig });
}));
router.get('/mygigs', AuthenticateUser, AuthenticateSeller, asyncerror(async (req, res) => {
    const gigs = await Gig.find({ business: req.user.business, type: "gig", status: "active" }).populate("business", "name _id").populate({
        path: "reviews",
        populate: {
            path: "user",
            select: "name",
        },
    });

    res.status(200).json({ success: true, gigs });

}));
router.get('/allmypost', AuthenticateUser, AuthenticateSeller, asyncerror(async (req, res) => {
    const gigs = await Gig.find({ business: req.user.business, status: "active" }).populate("business", "name _id").populate({
        path: "reviews",
        populate: {
            path: "user",
            select: "name",
        },
    });

    res.status(200).json({ success: true, gigs });

}));
router.get('/myproducts', AuthenticateUser, AuthenticateSeller, asyncerror(async (req, res) => {
    const products = await Gig.find({ business: req.user.business, type: "product", status: req.query.type }).populate("business", "name _id").populate({
        path: "reviews",
        populate: {
            path: "user",
            select: "name",
        },
    });

    res.status(200).json({ success: true, products });
}));
router.get('/myfoods', AuthenticateUser, AuthenticateSeller, asyncerror(async (req, res) => {
    const products = await Gig.find({ business: req.user.business, type: "food", status: req.query.type }).populate("business", "name _id").populate({
        path: "reviews",
        populate: {
            path: "user",
            select: "name",
        }
    });
    res.status(200).json({ success: true, products });
}));
router.get('/myjobs', AuthenticateUser, AuthenticateSeller, asyncerror(async (req, res) => {
    const products = await Gig.find({ business: req.user.business, type: "job", status: req.query.type }).populate("business", "name _id").populate({
        path: "reviews",
        populate: {
            path: "user",
            select: "name",
        }
    });
    res.status(200).json({ success: true, products });
}));
router.post('/deletegig', AuthenticateUser, AuthenticateSeller, asyncerror(async (req, res) => {

    const gig = await Gig.findById(req.body.id);
    if (gig.business.toString() === req.user.business.toString()) {
        await Gig.findByIdAndDelete(gig._id)
    } else {
        return next(new ErrorHandler("Unauthorized", 405))
    }
    res.status(200).json({ success: true, gig });
}));
router.post('/updategigstatus', AuthenticateUser, AuthenticateSeller, asyncerror(async (req, res) => {
    const gig = await Gig.findById(req.body.id);
    if (gig.business.toString() === req.user.business.toString()) {
        await Gig.findByIdAndUpdate(gig._id, {
            status: req.body.status
        })
    }
    res.status(200).json({ success: true, gig });
}));
router.get('/pausedgigs', AuthenticateUser, AuthenticateSeller, asyncerror(async (req, res) => {
    const gigs = await Gig.find({ status: "paused", type: "gig", business: req.user.business });
    res.status(200).json({ success: true, gigs });
}));
router.get('/draftgigs', AuthenticateUser, AuthenticateSeller, asyncerror(async (req, res) => {
    const gigs = await Gig.find({ status: "draft", type: "gig", business: req.user.business });
    res.status(200).json({ success: true, gigs });
}));



// Get public gig

router.get('/gigs', asyncerror(async (req, res) => {
    const searchKeyword = req.query.search;
    const regexPattern = new RegExp(searchKeyword, 'i');
    const gigs = await Gig.find({
         status: "active",
        $or: [
            { title: { $regex: regexPattern } },
            { positiveTags: { $in: [regexPattern] } }
        ]
    }).populate("business", "name _id rank").populate({
        path: "reviews",
        populate: {
            path: "user",
            select: "name",
        },
    });;

    const gigsWithRelevance = gigs.map(gig => {
        const relevanceScore = calculateRelevanceScore(gig.title, searchKeyword, gig.rank, gig.business.rank / 3);
        return { gig, relevanceScore };
    });
    const sortedGigs = gigsWithRelevance.sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.status(200).json({ success: true, gigs: sortedGigs.map(item => item.gig) });
}));

function calculateRelevanceScore(title, searchKeyword, rank, profilerank) {
    const occurrences = (title.match(new RegExp(searchKeyword, 'gi')) || []).length;
    const relevanceScore = occurrences + rank + profilerank;
    return relevanceScore;
}

router.get('/gig/:id', asyncerror(async (req, res) => {
    const id = req.params.id;
    const gig = await Gig.findById(id)
        .populate({
            path: "business",
            select: "name profileimage location",
        })
        .populate({
            path: "reviews",
            populate: {
                path: "user",
                select: "name",
            },
        });
    res.status(200).json({ success: true, gig });
}));
router.get('/sellergigs/:id', asyncerror(async (req, res) => {
    const id = req.params.id;
    const gigs = await Gig.find({business:id,status:"active"})
        .populate({
            path: "business",
            select: "name profileimage location description coverimage user",
    }).populate({
        path: "reviews",
        populate: {
            path: "user",
            select: "name",
        },
    });
    const reviews=await Review.find({business:id});
    let totalrating=0;
    let totalreviews=0;
    reviews.forEach(element => {
    totalreviews+=1;
    totalrating+=element.rating
    });
    totalrating=totalrating/totalreviews;
    console.log(totalrating)
    res.status(200).json({ success: true, gigs,totalrating,totalreviews });
}));

router.post('/addreview', AuthenticateUser, asyncerror(async (req, res, next) => {
    let verifyorder;
    verifyorder = await Order.findOne({
        $or: [
            { status: "product delivered" },
            { status: "completed" }
        ],
        _id: req.body.order,
        user: req.id
    });

    if (!verifyorder) {
        verifyorder = await ProductOrder.findOne({
            $or: [
                { status: "product delivered" },
                { status: "completed" }
            ],
            _id: req.body.order,
            user: req.id
        });
        if (!verifyorder) {
            return next(new ErrorHandler("We can't find any Active order!", 405))
        }
    }
    req.body.user = verifyorder.user;
    req.body.business = verifyorder.business;
    req.body.gig = verifyorder.gig;
    console.log(req.body)
    const review = await Review.create(req.body);
    await Gig.findByIdAndUpdate(
        req.body.gig,
        { $push: { reviews: review._id } }, // Add the review to the reviews array
        { new: true } // To return the updated gig object
    );
    await Order.findByIdAndUpdate(verifyorder._id, {
        review: review._id
    })
    res.status(200).json({ success: true });
}));
// Food



module.exports = router;
