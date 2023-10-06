const router = require('express').Router()

//................middleware......................
const Auth = require('../../middleware/checkAuth')

//.....................controller............
const RoommateController = require('../../controller/roommate.controller');


router.post('/add-room-mate', Auth.authUser, RoommateController.addRoommate);

router.get('/get-all-room-mate', Auth.authUser, RoommateController.getAllRoommate);

router.get('/get-room-mate-by-id', Auth.authUser, RoommateController.getRoommateById);

router.get('/get-roommate', Auth.authUser, RoommateController.getRoommate);

router.post('/book-roommate', Auth.authUser, RoommateController.bookingRoommate)

router.patch('/update-roommate/:id', Auth.authUser, RoommateController.updateRoommate)

router.delete('/delete-roommate-media', Auth.authUser, RoommateController.deleteRoommateMedia)

router.delete('/delete-roommate/:id', Auth.authUser, RoommateController.deleteRoommate)

router.get('/get-all-lifestyle', RoommateController.getAllLifestyle);

router.get('/get-all-socialmedia', RoommateController.getAllSocialmedia);

router.get('/get-all-interest', RoommateController.getAllInterest);





module.exports = router;