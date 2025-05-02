const mongoose = require("mongoose");
const Contact = new mongoose.Schema({
   name: {
      type: String,
   },
   email: {
      type: String,
      required: true,
      
   },
   phone: {
      type: String,
      required: true,
   },
   message: {
      type: String,
      required: true,
   },

   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Contact", Contact);
