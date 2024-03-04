const router = require('express').Router()

//................middleware......................
const Auth = require('../../middleware/checkAuth');

//.....................controller............
const historyController = require('../../controller/purchaseAndHistory.controller');

router.get('/get-history', Auth.authUser, historyController.updateStatusafterPayment)
router.patch('/status-update', Auth.authUser, historyController.updateStatusafterPaymentData);




module.exports = router;