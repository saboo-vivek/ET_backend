const User = require("../models/user");
const Expense = require("../models/expense");

exports.getLeaderBoard = async (req, res) => {
   try {
      const expenses = await User.find({})
         .select("name totalexpenses")
         .sort({ totalexpenses: -1 });

      console.log("Expenses for get leader");
      console.log(expenses);
      res.status(200).json(expenses);
   } catch (err) {
      console.log(err);
      res.status(500).json(err);
   }
};



exports.postData = async (req, res) => {
   try {
      console.log("report post Data");
      const userId = req.user._id;
      let { month, year } = req.body;
      month=parseInt(month)<10?('0'+parseInt(month)):month;

      const startDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
      const endDate = new Date(`${year}-${month}-01T00:00:00.000Z`);
      endDate.setMonth(endDate.getMonth() + 1);

      console.log(startDate, endDate);
      console.log("------------------------------");
      

      const data = await Expense.find({
         userId: userId,
         createdAt: {
            $gte: startDate,
            $lt: endDate,
         },
      }).select("price description category");

      console.log(data);
      res.status(200).json(data);
   } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
   }
};
