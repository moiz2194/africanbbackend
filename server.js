const app = require('./index.js');
const port = process.env.PORT || 5000;
const http = require('http').Server(app);
const jwt=require('jsonwebtoken');
const {router,Socket}=require('./Routes')
const io = require('socket.io')(http,{
  pingTimeout:60000,
  cors: {
    origin:[ "http://localhost:3000", "http://localhost:3001","https://africab-frontend.vercel.app"],
    credentials: true
  }
});

io.on('connection',(socket)=>{
  console.log('someone connected')
  socket.on('setup',(userID)=>{
    socket.join(userID)
    console.log(userID)
    socket.emit('connected')
  })
  socket.on('join chat',(room)=>{
    socket.join(room)
  })
  socket.on('new message',(messagerecieved)=>{
    var chat=messagerecieved.chat;
   if(!chat.users) return console.log('chat.users in undefined')
   chat.users.forEach(user => {
    if(user._id===messagerecieved.sender._id) return;
    console.log('emit')
    socket.in(user._id).emit("message received",messagerecieved)
   });
  })
})
app.get('/', (req, res) => {
    res.send('app is working');
});

http.listen(port, () => {
    console.log(`App is running at http://localhost:${port}`);
});

// Define a WebSocket connection handler
io.on('connection', (socket) => {
    console.log('WebSocket client connected');
    Socket(socket)
  });
  

process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Uncaught Exception`);
    process.exit(1);
});

process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err}`);
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);
  
    http.close(() => {
      process.exit(1);
    });
});
const getIO=()=>{
  return io
}
exports.Scan=getIO