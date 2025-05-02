const express=require('express');
const forgotController=require('../controllers/password');
// const authmiddleware = require('../middleware/authentication')
const router=express.Router();

// router.get('/forgotform',forgotController.getForm);

router.post('/password/forgotpassword',forgotController.postForgotpass);

// router.get('/password/resetpasswordform/:uuid',forgotController.getResetpassForm)
router.post('/password/update/:uuid',forgotController.postUpdate)



module.exports=router;