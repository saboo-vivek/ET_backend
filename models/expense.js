const { Double } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const expenseSchema = new Schema(
   {
      price: {
         type: Number,
         required: true,
      },
      description: {
         type: String,
         required: true,
      },
      category: {
         type: String,
         required: true,
      },
      userId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
      },
   },
   {
      timestamps: true,
   }
);

module.exports = mongoose.model("Expense", expenseSchema);
