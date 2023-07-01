const Users = require('../models/Users')
const jwt = require('jsonwebtoken')
const ErrorHandler = require("../middlewares/errorhandler")
const AuthenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization
    const user = jwt.verify(token, process.env.JWT_SECRET)
    const find = await Users.findById(user.userId)
    if (!find) {
      return next(new ErrorHandler('Login to continue', 405));
    }
    req.id = find.id
    req.user = find
    next()
  } catch (error) {
    return res.json({ status: false, error: error.message, error, msg: "Authentication error" })
  }
}

async function isadmin(req, res, next) {
  const id = req.id;
  const user = await Users.findById(id);
  if (user === null) {
    return next(new ErrorHandler('Login to continue', 405));

  }
  if (user.role !== 'admin') {
    return next(new ErrorHandler('Unauthorized', 401));
  }
  next()
}
async function AuthenticateSeller(req, res, next) {
  const id = req.id;
  const user = await Users.findById(id);
  if (user === null) {
    return next(new ErrorHandler('Login to continue', 405));

  }
  if (!user.seller) {
    return next(new ErrorHandler('Unauthorized', 401));
  }
  next()
}
module.exports = { AuthenticateUser, isadmin, AuthenticateSeller }