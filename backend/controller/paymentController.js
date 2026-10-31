
const razorpay = require("../config/razorpay");
const Payment = require("../models/Payment");
const createOrder = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }
    const amount = 500;
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    const payment = await Payment.create({
      userId,
      razorpayOrderId: order.id,
      amount,
      currency: "INR",
      status: "created",
    });
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error("Payment Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};
const crypto = require("crypto");
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details"
      });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: req.user.id
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment order not found"
      });
    }
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(
        payment.razorpayOrderId + "|" + razorpay_payment_id
      )
      .digest("hex");
    const expected = Buffer.from(generatedSignature, "hex");
    const received = Buffer.from(razorpay_signature, "hex");
    if (
      expected.length !== received.length ||
      !crypto.timingSafeEqual(expected, received)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }
    const razorpayPayment =
      await razorpay.payments.fetch(razorpay_payment_id);
    if (
      razorpayPayment.order_id !== payment.razorpayOrderId ||
      razorpayPayment.amount !== payment.amount * 100 ||
      razorpayPayment.currency !== payment.currency ||
      razorpayPayment.status !== "captured"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment not captured or details mismatch"
      });
    }
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.status = "paid";
    await payment.save();
    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentId: payment._id,
      status: payment.status
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed"
    });
  }
};
module.exports = { createOrder,
    verifyPayment
 };