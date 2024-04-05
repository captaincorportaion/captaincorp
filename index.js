// require("dotenv").config();
require("./helpers/global.js");
const express = require("express");
const app = express();
const cors = require("cors");
const fileUpload = require("express-fileupload");
const config = require("./config/config");
const multer = require("multer");
const upload = multer();
const path = require("path");
const { Server } = require("socket.io");
const socketController = require("./controller/chat.controller.js");
const fs = require("fs");
const { sendNotification } = require("./helpers/firebase.js");

app.use(upload.any());
app.use(cors());
// app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

//user routes
const userRoutes = require("./routes/index.js");
app.use("/api/v1", userRoutes);
app.get("/", (req, res) => {
  res.json({ status: true, message: "App running!" });
});

//send notification
// app.get("/send-notification", async (req, res) => {
//     const notificationData = {
//         title: "Test App Notification",
//         body: "This is Testing"
//     };
//     const token = "dwwI80kpsUBaoK25ywXyTq:APA91bHgXOAsWmXb8NfMdHxtlzDUewI6kdOUlLq1zt0kdF5lQWFWzz53fTccN0mPzkxQ1AIdXwtHe0JIyA5ZmKgd2yUPTXLNjti6t_wTH_KBjT7FOkpUW3_GN7dSzrV0VrSI6_vNmwHK";
//     const send = await sendNotification(token, notificationData).then((response) => {
//         console.log("Sent");
//         return res.status(200).json("Sent");
//     }).catch((err) => {
//         console.log(err);
//         return res.status(500);
//     })
// })

//Server
let server;
if (config.protocol == "https") {
  var https = require("https");
  const options = {
    key: fs.readFileSync(config.sslCertificates.privkey),
    cert: fs.readFileSync(config.sslCertificates.fullchain),
  };
  server = https.createServer(options, app);
} else {
  var http = require("http");
  server = http.createServer(app);
}
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.use(socketController.socketAuth);
socketController.socketEvent(io);

const port = process.env.PORT || 3000;
server.listen(port, (err) => {
  console.log(`Server running on ${port}.`);
});
