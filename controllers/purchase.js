

// exports.purchasepremium = async (req, res) => {
//   try {
//     console.log("Purchase premium API called...");
//     const amount = 1000;
//     const order_id = "ORDER_" + Math.floor(Math.random() * 100000);

//     const response = await axios.post(
//       `https://${CASHFREE_ENV === "TEST" ? "sandbox" : "api"}.cashfree.com/pg/orders`,
//       {
//         order_id,
//         order_amount: amount,
//         order_currency: "INR",
//         customer_details: {
//           customer_id: req.user._id.toString(),
//           customer_email: req.user.email,
//           customer_phone: req.user.phone || "9999999999",
//         },
//         order_meta: {
//           return_url: `http://localhost:3000/payment-status?order_id=${order_id}`,
//         },
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "x-api-version": "2022-09-01",
//           "x-client-id": CASHFREE_APP_ID,
//           "x-client-secret": CASHFREE_SECRET_KEY,
//         },
//       }
//     );
//     console.log("Cashfree API Response:", response.data);
//     console.log("Cashfree Payment URL:", response.data.payment_session_id);
//     const newOrder = new Order({ orderId: order_id, status: "PENDING" });
//     await newOrder.save();
//     getOrderDetails(order_id);

//     res.status(201).json({ payment_session_id: response.data.payment_session_id });
//   } catch (error) {
//     console.error("Error creating order:", error.response?.data || error.message);
//     res.status(500).json({ message: "Something went wrong", error });
//   }
// };

// exports.updatetransactionstatus = async (req, res) => {
//   const { order_id, payment_id } = req.body;
//   const userId = req.user._id;

//   console.log("Update transaction status API called...");

//   try {
//     const order = await Order.findOne({ orderId: order_id });
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     const response = await axios.get(
//       `https://${CASHFREE_ENV === "TEST" ? "sandbox" : "api"}.cashfree.com/pg/orders/${order_id}`,
//       {
//         headers: {
//           "x-api-version": "2022-09-01",
//           "x-client-id": CASHFREE_APP_ID,
//           "x-client-secret": CASHFREE_SECRET_KEY,
//         },
//       }
//     );

//     const orderStatus = response.data.order_status;

//     if (orderStatus === "PAID") {
//       await updateTransactionStatus(order_id, userId, true, payment_id);
//       const token = generateToken(userId, true);
//       res.status(200).json({ success: true, message: "Transaction Successful", token });
//     } else {
//       await updateTransactionStatus(order_id, userId, false);
//       const token = generateToken(userId, false);
//       res.status(200).json({ success: false, message: "Transaction Failed", token });
//     }
//   } catch (error) {
//     console.error("Error updating transaction status:", error.response?.data || error.message);
//     res.status(500).json({ message: "Something went wrong", error });
//   }
// };

// const updateTransactionStatus = async (order_id, userId, isSuccess, payment_id = null) => {
//   const orderUpdate = { status: isSuccess ? "SUCCESSFUL" : "FAILED" };
//   if (payment_id) orderUpdate.paymentId = payment_id;

//   const userUpdate = { ispremiumuser: isSuccess };

//   await Promise.all([
//     Order.updateOne({ orderId: order_id }, orderUpdate),
//     User.updateOne({ _id: userId }, userUpdate),
//   ]);
// };





// // Use sandbox or production URL as needed

// // For production: const url = `https://api.cashfree.com/pg/orders/${orderId}`;

// async function getOrderDetails(order_id) {
//   try {
//     console.log("getorderDetails function called: ")
//     const url = `https://sandbox.cashfree.com/pg/orders/${order_id}/payments`;
//     const response = await axios.get(url, {
//       headers: {
//         "x-api-version": "2022-09-01",
//         "x-client-id": CASHFREE_APP_ID,
//         "x-client-secret": CASHFREE_SECRET_KEY,
//       },
//     });

//     console.log('Get Order Details:', response.data);
//   } catch (error) {
//     if (error.response) {
//       console.error('Get Error:', error.response.status, error.response.data);
//     } else {
//       console.error('Get Request Error:', error.message);
//     }
//   }
// }


const axios = require("axios");
const Order = require("../models/order");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_ENV = process.env.CASHFREE_ENV || "TEST";
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:3000";

const generateToken = (userId, ispremiumuser) => {
  return jwt.sign({ _id: userId, ispremiumuser }, process.env.TOKEN_KEY, {
    expiresIn: "30d",
  });
};
const getCashfreeBaseUrl = () => {
  return "https://sandbox.cashfree.com";
};

exports.purchasepremium = async (req, res) => {
  try {
    console.log("Purchase premium API called...");
    const amount = 1000;
    const order_id = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const customer = req.user;

    const orderPayload = {
      order_id,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: customer._id.toString(),
        customer_email: customer.email,
        customer_phone: customer.phone || "9999999999",
      },
      order_meta: {
        return_url: `${FRONTEND_BASE_URL}/payment-status?order_id=${order_id}`,
        notify_url: `${process.env.BACKEND_BASE_URL}/purchase/webhook`,
      },
    };

    const response = await axios.post(
      `${getCashfreeBaseUrl()}/pg/orders`,
      orderPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2022-09-01",
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
        },
      }
    );

    // Save order to database
    const newOrder = new Order({
      orderId: order_id,
      status: "PENDING",
      userId: customer._id,
    });
    await newOrder.save();

    res.status(201).json({
      payment_session_id: response.data.payment_session_id,
      order_id,
    });
  } catch (error) {
    console.error("Order creation error:", {
      message: error.message,
      response: error.response?.data,
    });
    res.status(500).json({
      message: "Failed to create payment order",
      error: error.response?.data || error.message,
    });
  }
};

exports.updatetransactionstatus = async (req, res) => {
  console.log("updatetransactionstatus function called :....>")
  try {
    const { order_id } = req.body;
    const userId = req.user._id;

    // Verify order exists and belongs to user
    const order = await Order.findOne({ orderId: order_id });
    console.log("order:",order)

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check payment status with Cashfree
    const response = await axios.get(
      `${getCashfreeBaseUrl()}/pg/orders/${order_id}/payments`,
      {
        headers: {
          "x-api-version": "2022-09-01",
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
        },
      }
    );

    const payments = response.data;
    console.log("payments:",payments)

    const successfulPayment = payments.find(p => p.payment_status === "SUCCESS");

    if (successfulPayment) {
      await updateTransactionStatus(
        order_id,
        userId,
        true,
        successfulPayment.cf_payment_id
      );
      const token = generateToken(userId, true);
      return res.status(200).json({ success: true, token });
    }

    // No successful payment found
    await updateTransactionStatus(order_id, userId, false);
    const token = generateToken(userId, false);
    res.status(200).json({ success: false, token });
  } catch (error) {
    console.error("Transaction status error:", {
      message: error.message,
      response: error.response?.data,
    });
    res.status(500).json({
      message: "Failed to verify payment status",
      error: error.response?.data || error.message,
    });
  }
};

// Webhook handler for Cashfree notifications
exports.webhookHandler = async (req, res) => {
  try {
    console.log("web hook handler called.....")
    
    const { orderId, paymentId, paymentStatus } = req.body;
    console.log("orderId, paymentId, paymentStatus",orderId, paymentId, paymentStatus)
    
    if (paymentStatus !== "SUCCESS") {
      return res.status(200).json({ status: "ignored" });
    }

    // Verify the payment with Cashfree
    const paymentResponse = await axios.get(
      `${getCashfreeBaseUrl()}/pg/orders/${orderId}/payments/${paymentId}`,
      {
        headers: {
          "x-api-version": "2022-09-01",
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
        },
      }
    );

    const paymentData = paymentResponse.data;
    if (paymentData.payment_status !== "SUCCESS") {
      return res.status(400).json({ status: "invalid" });
    }

    // Update transaction status
    await updateTransactionStatus(
      orderId,
      paymentData.customer_details.customer_id,
      true,
      paymentId
    );

    res.status(200).json({ status: "processed" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ status: "error" });
  }
};

const updateTransactionStatus = async (orderId, userId, isSuccess, paymentId = null) => {
  const updates = {
    status: isSuccess ? "SUCCESSFUL" : "FAILED",
    updatedAt: new Date(),
  };

  if (paymentId) {
    updates.paymentId = paymentId;
  }

  await Promise.all([
    Order.updateOne({ orderId }, updates),
    User.updateOne({ _id: userId }, { ispremiumuser: isSuccess }),
  ]);
};