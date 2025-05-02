const { v4: uuidv4 } = require("uuid");
const ForgotPassword = require("../models/forgotpassword");
const User = require("../models/user");
const bcrypt = require("bcrypt");
// const path = require("path");

const Sib = require("sib-api-v3-sdk");

const client = Sib.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.API_KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();
const sender = {
   email: process.env.SENDER_EMAIL,
   name: process.env.SENDER_NAME,
};



exports.postForgotpass = async (req, res) => {
   try {
      const { email } = req.body;

      // Check if email is provided
      if (!email) {
         return res.status(400).json({ error: "Email is required" });
      }

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
         // User not found
         return res.status(404).json({ error: "User not found" });
      }

      // Generate unique ID for password reset
      const uuid = uuidv4();

      // Create password reset request
      const forgotpasswordrequest = new ForgotPassword({
         uuid: uuid,
         userId: user._id,
         isActive: true,
         userEmail: email,
      });
      await forgotpasswordrequest.save();

      // Send reset password email
      const resetPasswordLink = `${process.env.FRONTEND_RESETLINK}/${uuid}`;
      await tranEmailApi.sendTransacEmail({
         sender,
         to: [{ email }],
         subject: "Reset Password",
         textContent: resetPasswordLink,
         params: { uuid: uuid },
      });

      // Send response with reset password link
      const link = resetPasswordLink;
      return res.status(200).json({
         success: true,
         message: "Email sent to reset password",
         link: link,
      });
   } catch (err) {
      console.error("Error resetting password:", err);
      return res.status(500).json({ error: "Internal server error" });
   }
};




exports.postUpdate = async (req, res, next) => {
   const { password } = req.body;
   const uuid = req.params.uuid;

   try {
      const forgotpassword = await ForgotPassword.findOneAndUpdate(
         { uuid: uuid, isActive: true },
         { $set: { isActive: false } }
      );

      if (!forgotpassword) {
         console.log("Invalid req")
         return res.status(400).json({ message: "Invalid request" });
      }

      console.log('forgotpassword',forgotpassword)
      let email=forgotpassword.userEmail;
      const user = await User.findOne({ email });

      if (!user) {
         console.log('No such user found')
         return res.status(400).json({ message: "No such user found" });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      await User.findByIdAndUpdate(user._id, { password: hashedPassword });

      console.log("Password Updated");
      return res.status(201).json({ message: "Password changed successfully" });
   } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err });
   }
};


