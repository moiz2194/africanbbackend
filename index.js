// Import required modules
require('dotenv').config()
const express = require('express');
const https = require('https');
const http = require('http');
const socketIO = require('socket.io');
const mongoose=require('mongoose')
const cors=require('cors')
const authrouter=require('./controllers/AuthCtrl')
const gigrouter=require('./controllers/GigCtrl.js')
const orderrouter=require('./controllers/orderctrl.js')
const messages=require('./controllers/messages.js')
const chats=require('./controllers/chat.js')
const errormiddleware=require("./middlewares/error")
const {router,Socket}=require('./Routes')
const fs =require('fs')
// Initialize Express.js app and create server
const app = express();
const cloudinary = require('cloudinary').v2;


// Configuration 
cloudinary.config({
  cloud_name: "dhs0apbtc",
  api_key: "492326379893715",
  api_secret: "fzvCFJWTStKN4Qmrr3vQEkx6cUQ"
});

//Connecting Database
mongoose.connect(process.env.MONGODB_URI,{useNewUrlParser: true, useUnifiedTopology: true})
.then(res=>console.log("Database connected")).catch(err=>console.log(err))



// Apply Middlewares
app.use(cors())
app.use(express.json({ limit: '50mb' })); // Increase payload size limit

// Define a route for the REST API
app.use("/api",router);
app.use("/api/auth",authrouter);
app.use("/api/gig",gigrouter);
app.use("/api/order",orderrouter);

// Chat
app.use("/api/chat",chats)
app.use("/api/message",messages)


app.use(errormiddleware)
module.exports=app


