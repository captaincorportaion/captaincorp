// require("dotenv").config();
require('./helpers/global.js');
const express = require("express");
const app = express();
const cors = require("cors");
const fileUpload = require("express-fileupload");
const config = require('./config/config')
const multer = require('multer')
const upload = multer();
const path = require('path')
const { Server } = require('socket.io')
const socketController = require('./controller/chat.controller.js')


app.use(upload.any())
app.use(cors());
// app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')))

//user routes
const userRoutes = require('./routes/index.js')
app.use('/api/v1', userRoutes);



//Server
let server;
if (config.protocol == 'https') {
    var https = require('https')
    const options = {
        key: fs.readFileSync(config.sslCertificates.privkey),
        cert: fs.readFileSync(config.sslCertificates.fullchain)
    }
    server = https.createServer(options, app);
} else {
    var http = require('http')
    server = http.createServer(app);
};

const io = new Server(server, {
    cors: {
        origin: "*"
    }
})


io.use(socketController.socketAuth);
socketController.socketEvent(io);


const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running on ${port}.`);
});
