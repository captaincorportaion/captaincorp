const router = require('express').Router()

const saveController = require('../../controller/savePost.controller');
const notificationController = require('../../controller/notification.controller');
const chatController = require('../../controller/chat.controller');

const checkAuth = require('../../middleware/checkAuth')

router.post("/add-savepost", checkAuth.authUser, saveController.savePost);
router.get("/get-savepost", checkAuth.authUser, saveController.getSavePost);


//notification
router.get('/notifications', checkAuth.authUser, notificationController.notification);

router.patch('/notifications-update', checkAuth.authUser, notificationController.updateNotification);

//chat
router.get('/get-chat', checkAuth.authUser, chatController.getChatById);

module.exports = router;