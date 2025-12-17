import Payment from "../models/PaymentModel.js";
import Stripe from 'stripe';
import { User } from "../models/UserModel.js";
import { sendInvoiceEmail } from "../services/emailService.js";
import { generateInvoicePdf } from "../services/generateInvoicePdf.js";
const stripe = new Stripe('sk_test_51LXDlXLwLT6naIOwvb250nAoZE7weNfRROclxF7OS52R5XnmOlPDUhJymdDTdQT1RYxrOpPadJmQFsteo7TJOdXK00Cx3M3JIr');

export async function createPaymentIntent(req, res) {
  const { currency, customer, paymentMethodId, description, paymentTo } = req.body;
  const amount = 500; // cents

  try {
    const user = await User.findById(customer);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const newCustomer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
      });
      user.stripeCustomerId = newCustomer.id;
      await user.save();
      customerId = newCustomer.id;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      description,
    });

    const paymentRecord = new Payment({
      user: customer,
      amount,
      status: paymentIntent.status,
      paymentTo,
      stripePaymentIntentId: paymentIntent.id,
    });

    await paymentRecord.save();

    // ✅ SEND INVOICE ONLY IF PAYMENT SUCCEEDED
    if (paymentIntent.status === "succeeded") {
      const pdfBuffer = await generateInvoicePdf({
        invoiceNumber: paymentRecord._id.toString(),
        user,
        amount,
        description,
      });

      await sendInvoiceEmail({
        to: user.email,
        subject: "Payment Successful – Invoice Attached",
        text: `Hi ${user.fullName},\n\nYour payment was successful. Please find your invoice attached.\n\nThank you.`,
        pdfBuffer,
      });
    }

    return res.status(200).json({
      message: "Payment created successfully",
      paymentIntent,
    });

  } catch (error) {
    console.error("Error creating payment:", error);
    return res.status(500).json({
      message: "Error creating payment",
      error: error.message,
    });
  }
}
export async function deleteAllPaymentIntents(req, res) {
  try {
    const dbResult = await Payment.deleteMany({});
    
    return res.status(200).json({
      message: `Deleted ${dbResult.deletedCount} database records`,
      databaseDeleted: dbResult.deletedCount,

    });

  } catch (error) {
    console.error('Payment deletion error:', error);
    return res.status(500).json({
      message: 'Payment deletion failed',
      error: process.env.NODE_ENV === 'development' ? error.stack : 'Internal server error'
    });
  }
}