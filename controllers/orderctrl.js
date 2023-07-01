const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/Users');
const Gig = require('../models/Gigs');
const Order = require('../models/Order.js');
const ProductOrder = require('../models/productorder.js');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const asyncerror = require("../middlewares/catchasyncerror.js")
const { AuthenticateUser, AuthenticateSeller } = require('../middlewares/AuthenticateUser');
const ErrorHandler = require('../middlewares/errorhandler');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
function getFutureDate(days) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return futureDate;
}
function getFutureTime(minutes) {
    const futureTime = new Date();
    futureTime.setTime(futureTime.getTime() + minutes * 60000);
  
    return futureTime;
  }
  

router.post('/createorder/:gig', AuthenticateUser, asyncerror(async (req, res, next) => {
    console.log(req.params.gig)
    const gigdata = await Gig.findById(req.params.gig);
    if (gigdata.business === req.user.business) {
        return next(new ErrorHandler("You cannot order at your own gig", 405))
    }
    req.body.user = req.id;
    req.body.gig = gigdata._id;
    req.body.price = gigdata.price;
    req.body.business = gigdata.business;
    req.body.secondstatus = "waiting requirements"
    req.body.deliverydays = gigdata.deliverytime
    const order = await Order.create(req.body);
    res.status(200).json({ success: true, order });
}));
router.get('/order/:id', AuthenticateUser, asyncerror(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate("gig", "title images").populate("user", "name").populate("business", "name").populate("review");
    if (order.user._id.toString() !== req.id.toString() && order.business._id.toString() !== req.user.business.toString()) {
        return next(new ErrorHandler("Unauthorized", 405))
    }
    res.status(200).json({ success: true, order });
}));
router.get('/getmyorders', AuthenticateUser, asyncerror(async (req, res, next) => {
    let product, orders;
    orders = await Order.find({
        status: req.query.status,
        $or: [
            { user: req.id },
            { business: req.user.business }
        ]
    }).populate("gig", "title").populate("user", "name").populate("business", "name").populate("review");
    if (req.query.status === "completed") {
         product = await ProductOrder.find({
            status: { $in: ['completed', 'product delivered'] },
            $or: [
                { user: req.id },
                { business: req.user.business }
            ]
        }).populate("gig", "title").populate("user", "name").populate("business", "name").populate("review");
    } else {
        product = await ProductOrder.find({
            status: req.query.status,
            $or: [
                { user: req.id },
                { business: req.user.business }
            ]
        }).populate("gig", "title").populate("user", "name").populate("business", "name").populate("review");
    }
    const allOrders = [...orders, ...product];

    allOrders.sort((a, b) => b.date - a.date); // Sort by date in descending order

    res.status(200).json({ success: true, orders: allOrders });
}));
router.post('/sendrequirements', AuthenticateUser, asyncerror(async (req, res, next) => {
    const verifyorder = await Order.findById(req.body.order);
    req.body.user = req.id;
    req.body.deliverytime = getFutureDate(verifyorder.deliverydays);
    req.body.startdate = Date.now()
    if (req.body.bodyrequirementfiles) {
        let filearr = [];

        const uploadPromises = req.body.bodyrequirementfiles.map((file) => {
            console.log(file.type)
            if (file.file !== null) {
                return cloudinary.uploader
                    .upload(file.file, {
                        folder: "order files",
                        resource_type: "auto",
                    })
                    .then((result) => {
                        filearr.push({ public_id: result.public_id, url: result.url, extension: file.type, name: file.name });
                    })
                    .catch((error) => {
                        console.error("Error occurred while uploading file:", error);
                    });
            }
        });

        Promise.all(uploadPromises)
            .then(async () => {
                req.body.requirementfiles = filearr;
                const order = await Order.findByIdAndUpdate(req.body.order, {
                    requirementtext: req.body.requirementtext,
                    deliverytime: req.body.deliverytime,
                    startdate: req.body.startdate,
                    requirementfiles: req.body.requirementfiles,
                    secondstatus: "Pending"
                });
                res.status(200).json({ success: true, order });

            })
            .catch((error) => {
                console.error("Error occurred while uploading 2 files:", error);
                res.status(200).json({ success: false, message: "Error while uploading files" });

            });
    }


}));

router.post('/senddelivery', AuthenticateUser, AuthenticateSeller, asyncerror(async (req, res, next) => {
    const verifyorder = await Order.findOne({
        status: { $nin: ["completed", "cancelled"] },
        _id: req.body.order,
        business: req.user.business
    });

    if (!verifyorder) {
        return next(new ErrorHandler("We can't find any Active order!", 405))
    }
    req.body.completedate = Date.now()

    if (req.body.bodydeliveryfiles) {
        let filearr = [];

        const uploadPromises = req.body.bodydeliveryfiles.map((file) => {
            console.log(file.type)
            if (file.file !== null) {
                return cloudinary.uploader
                    .upload(file.file, {
                        folder: "order files",
                        resource_type: "auto",
                    })
                    .then((result) => {
                        filearr.push({ public_id: result.public_id, url: result.url, extension: file.type, name: file.name });
                    })
                    .catch((error) => {
                        console.error("Error occurred while uploading file:", error);
                    });
            }
        });

        Promise.all(uploadPromises)
            .then(async () => {
                req.body.deliveryfiles = filearr;
                const order = await Order.findByIdAndUpdate(req.body.order, {
                    deliveryfiles: req.body.deliveryfiles,
                    deliverytext: req.body.deliverytext,
                    completedate: req.body.completedate,
                    secondstatus: "delivered"
                })
                res.status(200).json({ success: true, order });
            })
            .catch((error) => {
                console.error("Error occurred while uploading 2 files:", error);
                res.status(400).json({ success: false, message: "Error while uploading files" });

            });
    }

}));
router.post('/acceptdelivery', AuthenticateUser, AuthenticateSeller, asyncerror(async (req, res, next) => {
    const verifyorder = await Order.findOne({
        status: { $nin: ["completed", "cancelled"] },
        _id: req.body.id,
        user: req.user
    });

    if (!verifyorder) {
        return next(new ErrorHandler("We can't find any Active order!", 405))
    }
    const order = await Order.findByIdAndUpdate(req.body.id, {
        status: "completed",
        secondstatus: null
    })
    res.status(200).json({ success: true, order });
}));
router.post('/requestcancel', AuthenticateUser, asyncerror(async (req, res, next) => {
    console.log(req.body.id)
    const verifyorder = await Order.findOne({
        status: { $nin: ["completed", "cancelled"] },
        _id: req.body.id
    });
    if (!verifyorder) {
        return next(new ErrorHandler("We can't find any Active order!", 405))
    }
    console.log(req.id, verifyorder)
    if (req.id.toString() === verifyorder.user.toString()) {
        req.body.requestcancel = "user"
    } else if (req.user.business.toString() === verifyorder.business.toString()) {
        req.body.requestcancel = "business"
    }
    else {
        return next(new ErrorHandler("You are unauthorized to cancel this order!", 405))
    }
    const order = await Order.findByIdAndUpdate(req.body.id, {
        requestcancel: req.body.requestcancel,
        secondstatus: "dispute",
        reason: req.body.reason
    })
    res.status(200).json({ success: true, order });
}));
router.post('/acceptcancel', AuthenticateUser, asyncerror(async (req, res, next) => {
    const verifyorder = await Order.findOne({
        status: { $nin: ["completed", "cancelled"] },
        _id: req.body.id
    });

    if (!verifyorder) {
        return next(new ErrorHandler("We can't find any Active order!", 405))
    }
    if (req.id.toString() === verifyorder.user.toString()) {
        req.body.acceptcancel = "user"
    } else if (req.user.business.toString() === verifyorder.business.toString()) {
        req.body.acceptcancel = "business"
    }
    else {
        return next(new ErrorHandler("You are unauthorized to cancel this order!", 405))
    }
    const order = await Order.findByIdAndUpdate(req.body.id, {
        acceptcancel: req.body.acceptcancel,
        status: "cancelled",
        secondstatus: null
    })
    res.status(200).json({ success: true, order });
}));


router.get('/productorder/:id', AuthenticateUser, asyncerror(async (req, res, next) => {
    const order = await ProductOrder.findById(req.params.id).populate("gig", "title images").populate("user", "name").populate("business", "name").populate("review");
    if (order.user._id.toString() !== req.id.toString() && order.business._id.toString() !== req.user.business.toString()) {
        return next(new ErrorHandler("Unauthorized", 405))
    }
    res.status(200).json({ success: true, order });
}));
router.post('/product/createorder/:product', AuthenticateUser, asyncerror(async (req, res, next) => {
    console.log(req.params.product)
    const gigdata = await Gig.findById(req.params.product);
    if (gigdata.business === req.user.business) {
        return next(new ErrorHandler("You cannot order at your own gig", 405))
    }
    req.body.user = req.id;
    req.body.gig = gigdata._id;
    req.body.price = gigdata.price;
    req.body.startdate = Date.now()
    req.body.business = gigdata.business;
    req.body.secondstatus = "Waiting Delivery"
    if(gigdata.type==="food"){
        req.body.deliverytime = getFutureTime(gigdata.deliverytime);
    }else{
        req.body.deliverytime = getFutureDate(gigdata.deliverytime);
        req.body.return = getFutureDate(gigdata.return);
    }
    const order = await ProductOrder.create(req.body);
    res.status(200).json({ success: true, order });
}));
router.post('/product/sendtracking/:product', AuthenticateUser, asyncerror(async (req, res, next) => {
    console.log(req.params.product)
    const verifyorder = await ProductOrder.findOne({
        status: { $nin: ["completed", "cancelled"] },
        _id: req.params.product
    });

    if (!verifyorder) {
        return next(new ErrorHandler("We can't find any Active order!", 405))
    }
    const order = await ProductOrder.findByIdAndUpdate(req.params.product, {
        trackingid: req.body.trackingid,
        trackingname: req.body.trackingname,
        secondstatus: "on the way"
    });
    res.status(200).json({ success: true, order });
}));
router.post('/product/deliver/:product', AuthenticateUser, asyncerror(async (req, res, next) => {
    console.log(req.params.product)
    const verifyorder = await ProductOrder.findOne({
        status: { $nin: ["completed", "cancelled"] },
        _id: req.params.product
    });

    if (!verifyorder) {
        return next(new ErrorHandler("We can't find any Active order!", 405))
    }
    const order = await ProductOrder.findByIdAndUpdate(req.params.product, {
        status: "product delivered",
        secondstatus: null,
        completedate: Date.now()
    });
    res.status(200).json({ success: true, order });
}));
router.post('/product/requestcancel/:product', AuthenticateUser, asyncerror(async (req, res, next) => {
    console.log("revieved")
    const verifyorder = await ProductOrder.findOne({
        status: { $nin: ["completed", "cancelled"] },
        _id: req.params.product
    });
    if (!verifyorder) {
        return next(new ErrorHandler("We can't find any Active order!", 405))
    }
    console.log(req.id, verifyorder)
    if (req.id.toString() === verifyorder.user.toString()) {
        req.body.requestcancel = "user"
    } else if (req.user.business.toString() === verifyorder.business.toString()) {
        req.body.requestcancel = "business"
    }
    else {
        return next(new ErrorHandler("You are unauthorized to cancel this order!", 405))
    }
    const order = await ProductOrder.findByIdAndUpdate(req.body.id, {
        requestcancel: req.body.requestcancel,
        secondstatus: "dispute",
        reason: req.body.reason
    })
    res.status(200).json({ success: true, order });
}));
router.post('/product/acceptcancel/:product', AuthenticateUser, asyncerror(async (req, res, next) => {
    const verifyorder = await ProductOrder.findOne({
        status: { $nin: ["completed", "cancelled"] },
        _id: req.body.id
    });

    if (!verifyorder) {
        return next(new ErrorHandler("We can't find any Active order!", 405))
    }
    if (req.id.toString() === verifyorder.user.toString()) {
        req.body.acceptcancel = "user"
    } else if (req.user.business.toString() === verifyorder.business.toString()) {
        req.body.acceptcancel = "business"
    }
    else {
        return next(new ErrorHandler("You are unauthorized to cancel this order!", 405))
    }
    const order = await ProductOrder.findByIdAndUpdate(req.body.id, {
        acceptcancel: req.body.acceptcancel,
        status: "cancelled",
        secondstatus: null
    })
    res.status(200).json({ success: true, order });
}));

module.exports = router;
