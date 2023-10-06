//Define here all helpers file as global variable
const dbObject = require('../config/db.config.js');
const db = require('../config/db.config.js');
// Provide sucess and error related response method 
if (!global.RESPONSE)
    global.RESPONSE = require('./response.js');

// Provide file manipulation related functions 
if (!global.FILEACTION)
    global.FILEACTION = require('./file.js');

// Provide assets url functions
if (!global.ASSETS)
    global.ASSETS = require('./assets.js');

// if (!global.getAuthUser)
//     global.getAuthUser = async function (req) {
//         let headerToken = req.headers.authorization ? req.headers.authorization : null;
//         let customerSessionObj = await dbObject.customer_session.findOne({ where: { token: headerToken } });
//         let customerObj = null;
//         if (customerSessionObj) {
//             customerObj = await dbObject.customers.findOne({
//                 where: { id: customerSessionObj.customer_id },
//                 attributes: ['id', 'firstname', 'lastname'],
//             });
//         }
//         return customerObj;
//     };

// if (!global.getUserProfile)
//     global.getUserProfile = async function (id) {
//         let userObj = {};
//         userData = await dbObject.user.findOne({
//             where: { id: id },
//         });
//         userObj = userData.toJSON()
//         return userObj;
//     };
