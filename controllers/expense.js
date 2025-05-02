const Expense = require("../models/expense");
const User = require("../models/user");

const ContactUs = require("../models/contactus");



exports.postContactUs = async (req, res) => {
   console.log("In Post Contact us");
   const { name, phone, message } = req.body;
   const userId = req.user._id;
   const email = req.user.email;

   try {
      const query = new ContactUs({
         name,
         email,
         phone,
         message,
         userId,
      });
      await query.save();
      console.log(query);
      res.status(200).send(query);
   } catch (error) {
      console.log(error);
      
      res.status(500).json({ error: "Internal server error" });
   }
};

exports.getAll = (req, res) => {
   console.log("------------------");
   console.log(req.user);
   console.log("------------------");
   Expense.find({
      userId: req.user._id,
   })
      .sort([["updatedAt", -1]])
      .then((data) => {
         res.status(200).send(data);
      });
};

exports.postAddExpense = async (req, res) => {
   console.log("In Post Add Expense");
   const { price, description, category } = req.body;
   const userId = req.user._id;

   try {
      const data = new Expense({
         price,
         description,
         category,
         userId,
      });
      await data.save();

      const totalExpense = Number(req.user.totalexpenses) + Number(price);

      await User.updateOne({ _id: userId }, { totalexpenses: totalExpense });

      console.log(data);
      res.status(200).send(data);
   } catch (error) {
      console.log("ERROR:", error);
      res.status(500).json({ error: error });
   }
};

exports.delExpense = async (req, res) => {
   console.log("In Delete Expense");
   try {
      const id = req.params.id;
      const exp = await Expense.findOne({ _id: id, userId: req.user._id });

      console.log(exp);
      let amt = exp.price;
      const totalExpense = Number(req.user.totalexpenses) - Number(amt);
      await User.updateOne(
         { _id: req.user._id },
         { totalexpenses: totalExpense }
      );
      await exp.deleteOne();
      res.status(200).send("Data deleted successfully");
   } catch (error) {
      res.status(500).send(error);
      console.log(error);
   }
};

exports.updateExpense = async (req, res) => {
   console.log("In update Expense");
   try {
      const { id } = req.params;
      const { price, description, category } = req.body;
      const updatedExpense = await Expense.findByIdAndUpdate(id, {
         price,
         description,
         category,
      });

      console.log(updatedExpense);
      if (!updatedExpense) {
         return res.status(404).send({ message: "Expense not found" });
      }

      res.status(200).send({ result: updatedExpense });
   } catch (error) {
      console.error("Error updating expense:", error);
      res.status(500).send({ message: "Internal server error" });
   }
};

const S3services = require("../services/s3services");
exports.getDownload = async (req, res, next) => {
   try {
      console.log("Get Download");
      // console.log(req.user);
      const userId = req.user._id;
      const expenses = await Expense.find({ userId });
      const stringifiedExpenses = JSON.stringify(expenses);
      const filename = `Expenses${userId}/${new Date()}.txt`;
      const fileUrl = await S3services.uploadtoS3(
         stringifiedExpenses,
         filename
      );
      res.status(200).json({ fileUrl, success: true });
   } catch (err) {
      console.log(err);
      res.status(500).json({ fileUrl: "", success: false, err: err });
   }
};
