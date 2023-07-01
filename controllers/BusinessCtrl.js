const Business = require('../models/Businesses');
const Users=require('../models/Users')
const cloudinary=require('cloudinary').v2
// Create a new business
exports.createBusiness =async (req, res, next) => {
  if(req.body.selectedImage){
    const result=await cloudinary.uploader.upload(req.body.selectedImage,{
      folder:"businessimg"
    })
    req.body.profileimage={url:result.url,public_id:result.public_id}
  }
  if(req.body.selectedImage2){
    const result=await cloudinary.uploader.upload(req.body.selectedImage2,{
      folder:"businessimg"
    })
    req.body.coverimage={url:result.url,public_id:result.public_id}

  };
  req.body.location={
    type: 'Point',
    coordinates: [req.body.lng ,req.body.lat ]
  }
  req.body.user=req.id
  const business = new Business(req.body);
  business.save()
    .then(async(createdBusiness) => {
      await Users.findByIdAndUpdate(req.id, {  business: createdBusiness._id ,seller:true,signupseller:false})
      res.status(201).json({
        success:true,
        message: 'Your Business added successfully',
        business: createdBusiness
      });
    })
    .catch(error => {
      res.status(500).json({
        message:error.message,
        error: error
      });
    });
};






// Get a single business by ID
exports.getBusinessById = (req, res, next) => {
  Business.findById(req.params.id)
    .then(business => {
      if (business) {
        res.status(200).json({
          success:true,
          message: 'Business fetched successfully',
          business: business
        });
      } else {
        res.status(404).json({
          message: 'Business not found'
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Failed to fetch business',
        error: error
      });
    });
};

// Update a business by ID
exports.updateBusinessById = (req, res, next) => {
  const business = new Business({
    _id: req.params.id,
    name: req.body.name,
    slogan: req.body.slogan,
    website: req.body.website,
    facebook: req.body.facebook,
    instagram: req.body.instagram,
    category: req.body.category,
    location: {
      type: 'Point',
      coordinates: req.body.coordinates
    },
    description: req.body.description,
    profileimage: req.body.profileimage,
    coverimage: req.body.coverimage,
  });
  Business.updateOne({ _id: req.params.id }, business)
    .then(result => {
      if (result.nModified > 0) {
        res.status(200).json({
          message: 'Business updated successfully',
          result: result
        });
      } else {
        res.status(404).json({
          message: 'Business not found'
        });
      }
    })
    .catch(error => {
      res.status(500).json({
        message: 'Failed to update business',
        error: error
      });
    });
};

// Delete a business by ID
exports.deleteBusinessById = (req, res, next) => {
    Business.deleteOne({ _id: req.params.id })
      .then(result => {
        if (result.deletedCount > 0) {
          res.status(200).json({
            message: 'Business deleted successfully',
            result: result
          });
        } else {
          res.status(404).json({
            message: 'Business not found'
          });
        }
      })
      .catch(error => {
        res.status(500).json({
          message: 'Failed to delete business',
          error: error
        });
      });
  };