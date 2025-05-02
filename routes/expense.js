const express = require("express");
const expenseController = require("../controllers/expense");
const authmiddleware = require("../middleware/authentication");
const router = express.Router();

// router.get("/app", expenseController.getApp);

router.get(
   "/pastentries",
   authmiddleware.authenticate,
   expenseController.getAll
);

router.post(
   "/addexpense",
   authmiddleware.authenticate,
   expenseController.postAddExpense
);
router.post(
   "/contactus",
   authmiddleware.authenticate,
   expenseController.postContactUs
);
router.delete(
   "/deletexpense/:id",
   authmiddleware.authenticate,
   expenseController.delExpense
);
router.get(
   "/download",
   authmiddleware.authenticate,
   authmiddleware.checkPremium,
   expenseController.getDownload
);
router.put("/update/:id",authmiddleware.authenticate,
expenseController.updateExpense)

module.exports = router;
