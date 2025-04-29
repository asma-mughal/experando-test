import Stripe from "stripe";
import dotenv from "dotenv";

export const createStripeCustomer = async (user) => {
  return await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      userId: user._id.toString(),
    },
  });
};

export const createStripeSubscription = async (customerId, priceId) => {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"],
  });
};

export const cancelStripeSubscription = async (subscriptionId) => {
  return await stripe.subscriptions.cancel(subscriptionId);
};

export const getStripeSubscription = async (subscriptionId) => {
  return await stripe.subscriptions.retrieve(subscriptionId);
};
