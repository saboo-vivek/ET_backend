const express=require('express');
const authController=require('../controllers/auth');
const router=express.Router();

// router.get('/',authController.getHome);
// router.get('/loginpage',authController.getLoginpage)

router.post('/signup',authController.postSignup);
router.post('/login',authController.postLogin)

module.exports=router;