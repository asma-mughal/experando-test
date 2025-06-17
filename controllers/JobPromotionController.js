import Stripe from "stripe";
import { JobPromotion } from "../models/JobPromotion.js";
import Service from "../models/ServiceModel.js";
import { User } from "../models/UserModel.js";
import BusinessProfile from "../models/BusniessModel.js";

const stripe = Stripe(
  "sk_test_51LXDlXLwLT6naIOwvb250nAoZE7weNfRROclxF7OS52R5XnmOlPDUhJymdDTdQT1RYxrOpPadJmQFsteo7TJOdXK00Cx3M3JIr"
);
export const subscribeToJobPromotion = async (req, res) => {
  const { id, type, plan } = req.query;
  const { user } = req;
  const userId = user?.id;

  if (!id || !type || !plan) {
    return res.status(400).json({ error: "ID, type, and plan are required" });
  }

  const priceIdMapping = {
    basic: "price_1RJ6UiLwLT6naIOwa6JrCRid",
    standard: "price_1RJ6VPLwLT6naIOwiafXaVDe",
    premium: "price_1RJ6W6LwLT6naIOwIXorXKgI",
  };

  const planDurations = {
    basic: 7,
    standard: 14,
    premium: 30,
  };

  const priceId = priceIdMapping[plan.toLowerCase()];
  if (!priceId) {
    return res.status(400).json({ error: "Invalid subscription plan" });
  }

  try {
    let target;
    if (type === "Service") {
      target = await Service.findById(id);
    } else if (type === "Business") {
      target = await BusinessProfile.findById(id);
    }

    if (!target) {
      return res.status(404).json({ error: `${type} not found` });
    }

    const existingPromotion = await JobPromotion.findOne({
      ...(type === "Service" ? { serviceId: id } : { businessId: id }),
      promotionEndDate: { $gt: new Date() },
    });

    if (existingPromotion) {
      return res
        .status(400)
        .json({ error: `${type} already has an active promotion` });
    }

    let customer;
    if (user?.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user?.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: userId.toString() },
      });

      await User.findByIdAndUpdate(
        userId,
        { stripeCustomerId: customer.id },
        { new: true }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: customer.id,
      success_url:
        type === "Service"
          ? `http://localhost:5173/promotion/clientPromotion/${id}?session_id={CHECKOUT_SESSION_ID}&id=${id}&type=${type}&plan=${plan}`
          : `http://localhost:5173/promotion/craftsmanPromotion/${id}?session_id={CHECKOUT_SESSION_ID}&id=${id}&type=${type}&plan=${plan}`,
      cancel_url: `http://127.0.0.1:5173/promotion/cancel?id=${id}`,
      metadata: {
        plan,
        userId: userId.toString(),
        id,
        type,
        promotionDurationDays: planDurations[plan.toLowerCase()] || 30,
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating promotion session:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

export const subscriptionSuccess = async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.query.session_id
    );

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not successful" });
    }

    const { userId, plan, id, type, promotionDurationDays } = session.metadata;

    if (!userId || !plan || !id || !type) {
      return res.status(400).json({ error: "Missing session metadata" });
    }

    const promotionEndDate = new Date();
    promotionEndDate.setDate(
      promotionEndDate.getDate() + Number(promotionDurationDays)
    );

    const promoData = {
      promotedType: type,
      user: userId,
      job: id,
      promotionType: type,
      promotionPackage: plan.charAt(0).toUpperCase() + plan.slice(1),
      promotionDurationDays: Number(promotionDurationDays),
      promotionStartDate: new Date(),
      promotionEndDate,
      paymentStatus: "Paid",
      isActive: true,
    };

    if (type === "Service") {
      promoData.serviceId = id;
    } else if (type === "Business") {
      promoData.businessId = id;
    }

    await JobPromotion.create(promoData);
    if (type === "Service") {
      await Service.findByIdAndUpdate(id, { promoted: true });
    } else if (type === "Business") {
      await BusinessProfile.findByIdAndUpdate(id, { promoted: true });
    }

    res.status(200).json({ message: `${type} promoted successfully` });
  } catch (error) {
    console.error("Error in promotion success:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

const cancelStripeSubscription = async (subscriptionId) => {
  try {
    const canceledSubscription = await stripe.subscriptions.cancel(
      subscriptionId
    );
    const sessionList = await stripe.checkout.sessions.list({
      subscription: subscriptionId,
      limit: 1,
    });

    const session = sessionList.data[0];

    if (!session || !session.metadata) {
      console.warn("No session metadata found for canceled subscription.");
      return true;
    }

    const { userId, plan, id, type } = session.metadata;
    await JobPromotion.findOneAndUpdate(
      {
        user: userId,
        promotionPackage: plan.charAt(0).toUpperCase() + plan.slice(1),
        promotionType: type,
        isActive: true,
      },
      {
        isActive: false,
        paymentStatus: "Cancelled",
        promotionEndDate: new Date(),
      }
    );
    if (type === "Service") {
      await Service.findByIdAndUpdate(id, { promoted: false });
    } else if (type === "Business") {
      await BusinessProfile.findByIdAndUpdate(id, { promoted: false });
    }

    return true;
  } catch (error) {
    console.error("Error cancelling subscription and updating DB:", error);
    return false;
  }
};

export const cleanupExpiredPromotions = async () => {
  try {
    const now = new Date();
    const expiredPromotions = await JobPromotion.find({
      promotionEndDate: { $lt: now },
      isActive: true,
    });

    for (const promotion of expiredPromotions) {
      if (promotion.stripeSubscriptionId) {
        await cancelStripeSubscription(promotion.stripeSubscriptionId);
      }

      promotion.isActive = false;
      promotion.paymentStatus = "Expired";
      await promotion.save();
    }

    return { success: true, count: expiredPromotions.length };
  } catch (error) {
    console.error("Error cleaning up expired promotions:", error);
    return { success: false, error: error.message };
  }
};
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "customer.subscription.deleted":
        const subscription = event.data.object;
        await JobPromotion.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          {
            isActive: false,
            paymentStatus: "Cancelled",
            promotionEndDate: new Date(),
          }
        );
        break;

      case "invoice.payment_failed":
        const invoice = event.data.object;
        await JobPromotion.findOneAndUpdate(
          { stripeSubscriptionId: invoice.subscription },
          { paymentStatus: "Failed" }
        );
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const cancelJobPromotion = async (req, res) => {
  const { jobId } = req.body;
  const { user } = req;

  if (!jobId) {
    return res.status(400).json({ error: "Job ID is required" });
  }
  try {
    const promotion = await JobPromotion.findOne({
      job: jobId,
      user: user.id,
      isActive: true,
    });
    console.log(user.id);
    if (!promotion) {
      return res.status(404).json({
        error: "No active promotion found for this job",
      });
    }
    let stripeCancellationSuccess = true;
    if (promotion.stripeSubscriptionId) {
      stripeCancellationSuccess = await cancelStripeSubscription(
        promotion.stripeSubscriptionId
      );
    }
    promotion.isActive = false;
    promotion.paymentStatus = "Expired";
    promotion.promotionEndDate = new Date(); // End immediately
    await promotion.save();

    res.status(200).json({
      success: true,
      message: "Promotion cancelled successfully",
      stripeCancellationSuccess,
    });
  } catch (error) {
    console.error("Error cancelling job promotion:", error);
    res.status(500).json({
      error: "Failed to cancel promotion",
      details: error.message,
    });
  }
};
export const deleteAllJobsPromotions = async (req, res) => {
  try {
    const result = await JobPromotion.deleteMany({});
    
    return res.status(200).json({
      message: `Successfully deleted ${result.deletedCount} JobPromotion`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      message: "Error deleting JobPromotion", 
      error: error.message 
    });
  }
};