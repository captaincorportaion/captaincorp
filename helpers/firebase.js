// var admin = require("firebase-admin");
// const { Messaging } = require('firebase-admin');

// var serviceAccount = require("../config/firebase-admin-cread.json");

// const fireAuth = admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });
// const db = require("../config/db.config");

// const User = db.users

// const sendNotification = async (req, deviceToken, notification) => {
//     try {
//         const { user: { id } } = req;
//         const findUser = await User.findOne({ where: { id: id } })
//         console.log('findUser', findUser)

//         let message;
//         if (findUser.fcm_token_type == "1") {
//             const message = {
//                 data: {
//                     title: notification.title,
//                     body: notification.body,
//                 },
//                 token: deviceToken,
//             };
//         } else {
//             const message = {
//                 notification: {
//                     title: notification.title,
//                     body: notification.body,
//                 },
//                 token: deviceToken,
//             };
//         }

//         const response = await admin.messaging().send(message);
//         console.log('Successfully sent notification:', response);
//     } catch (error) {
//         console.error('Error sending notification:', error);
//     }
// };

// module.exports = { sendNotification };


var admin = require("firebase-admin");
const { Messaging } = require('firebase-admin');

var serviceAccount = require("../config/firebase-admin-cread.json");

// Initialize Firebase Admin SDK
const fireAuth = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const sendNotification = async (userData, notification) => {
    try {
        if (!userData.user || !userData.user.id) {
            throw new Error("User ID not found in request");
        }

        let message;

        if (userData.user.fcm_token_type == "1") {
            message = {
                data: {
                    title: notification.title,
                    body: notification.body,
                },
                token: userData.user.fcm_token,
            };
        } else {
            message = {
                notification: {
                    title: notification.title,
                    body: notification.body,
                },
                token: userData.user.fcm_token,
            };
        }
        const response = await fireAuth.messaging().send(message);
        console.log('Successfully sent notification:', response);
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};


module.exports = { sendNotification };
