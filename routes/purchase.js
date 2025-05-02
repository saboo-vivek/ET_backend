const express = require('express');
const authmiddleware = require('../middleware/authentication')
const purchaseController = require('../controllers/purchase');

const router = express.Router();

router.get('/purchase/premium', authmiddleware.authenticate ,purchaseController.purchasepremium);
router.get('/purchase/webhook', authmiddleware.authenticate ,purchaseController.webhookHandler);
router.post('/purchase/updatetransactionstatus', authmiddleware.authenticate ,purchaseController.updatetransactionstatus);


module.exports = router ;