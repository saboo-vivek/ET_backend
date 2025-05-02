
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
   name: {
      type: String,
      required: true,
   },
   email: {
      type: String,
      required: true,
      unique: true,
   },
   password: {
      type: String,
      required: true,
   },
   ispremiumuser: {
      type: Boolean,
      default: false,
   },
   totalexpenses: {
      type: Number,
      default: 0,
   },
   
});

module.exports = mongoose.model("User", userSchema);
