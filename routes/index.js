const router = require('express').Router()

// auth routes
const authRoutes = require("./auth/auth.routes");
router.use("/user", authRoutes);

//rooms routes
const roomRoutes = require('./room/rooms.routes')
router.use("/room", roomRoutes);

//event routes
const eventRoutes = require("./event/event.routes");
router.use('/event', eventRoutes);

//item routes
const itemRoutes = require('./item/item.route');
router.use('/item', itemRoutes);

//roommate routes
const roommateRoutes = require('./roommate/roommate.route');
router.use('/roommate', roommateRoutes);


//save post
const savePostRoutes = require('./savepost/savePost.routes');
router.use('/post', savePostRoutes);

//card
const cardRoutes = require('./card/card.routes');
router.use('/card', cardRoutes);


module.exports = router;
