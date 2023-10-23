const router = require('express').Router()

const authController = require('../../controller/auth.controller');
const checkAuth = require('../../middleware/checkAuth')

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.patch("/update-profile", checkAuth.authUser, authController.updateProfile);
router.get("/get-profile", checkAuth.authUser, authController.getProfile);

// reset resetPassword
router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword", authController.resetPassword);



module.exports = router;