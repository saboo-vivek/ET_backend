const express = require('express');
const authmiddleware = require('../middleware/authentication')
const premiumController = require('../controllers/premium');

const router = express.Router();

router.get('/premium/getleaderboard', authmiddleware.authenticate ,premiumController.getLeaderBoard);

// router.get('/premium/reportgeneration', authmiddleware.authenticate ,premiumController.getReport);
// router.get('/premium/reportgeneration', premiumController.getReportPage);

router.post('/premium/report/data/:userId',authmiddleware.authenticate,premiumController.postData)

// router.post('/report/download/:id',premiumController.getDownload)



// router.post('/purchase/updatetransactionfail', authmiddleware.authenticate ,purchaseController.updateTransactionFail);

module.exports = router ;