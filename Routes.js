const router = require("express").Router()
const {createBusiness,getBusinessById,updateBusinessById,deleteBusinessById} = require('./controllers/BusinessCtrl');
const { searchQuestions, createQuestion, updateQuestion } = require("./controllers/CommunityCtrl");
const { createNewsletter, getAllNewsletters, getNewsletterById } = require("./controllers/NewsletterCtrl");
const {AuthenticateUser} = require("./middlewares/AuthenticateUser");
const cron = require('node-cron');
const Order = require('./models/productorder.js');



  
router.get('/', (req, res) => {
    res.json({ message: 'Hello, world!' });
});



//Businesses/Posts Routes
router.post("/beseller", AuthenticateUser,createBusiness)
router.get("/getpost/:id",getBusinessById)

//Newsletter Routes
router.post("/createnews", AuthenticateUser,createNewsletter)
router.get("/getnews",getAllNewsletters)
router.get("/getnews/:id",getNewsletterById)

//Community Routes
router.post("/question",AuthenticateUser,createQuestion)
router.put("/question/:id",AuthenticateUser,updateQuestion)
router.get("/question",searchQuestions)

// */1 * * * *
cron.schedule('0 0 * * *', async () => {
    try {
      const currentDate = new Date();
      
      // Find orders where return date is in the past and status is not yet completed
      const ordersToUpdate = await Order.find({
        status: { $ne: 'completed' },
        return: { $lte: currentDate }
      });
  
      // Update the status of each order to 'completed'
      for (const order of ordersToUpdate) {
        order.status = 'completed';
        await order.save();
      }
  
      console.log('Order status updated successfully.');
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  });
const Socket = (socket) => {

    // Handle incoming messages from the WebSocket client
    socket.on('message', (message) => {
        console.log(`Received message: ${message}`);

        // Echo the message back to the client
        socket.emit('message', `You sent: ${message}`);
    });
    // Handle WebSocket client disconnections
    socket.on('disconnect', () => {
        console.log('WebSocket client disconnected');
    });
}


module.exports = { Socket, router }