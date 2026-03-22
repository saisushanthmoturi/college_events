const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpayInstance;
try {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} catch (e) {
  console.warn('⚠️  Razorpay not configured. Payment features will be disabled.');
}

// POST /api/payments/create-order
exports.createOrder = async (req, res, next) => {
  try {
    if (!razorpayInstance) {
      return res.status(503).json({ success: false, message: 'Payment gateway not configured' });
    }

    const { amount, eventId, eventTitle } = req.body;

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: `event_${eventId}_${Date.now()}`,
      notes: {
        eventId,
        eventTitle,
        userId: req.user._id.toString(),
      },
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/payments/verify
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      res.json({ success: true, paymentId: razorpay_payment_id, orderId: razorpay_order_id });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    next(error);
  }
};
