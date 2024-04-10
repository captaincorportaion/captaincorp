const Validator = require("validatorjs");
const { Op } = require("sequelize");
const db = require("../config/db.config");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Card = db.card;
const Users = db.users;

const addCard = async (req, res) => {
  try {
    const requestData = req.body;

    const authUserId = req.user.id;
    const token = requestData.tokenId;

    let stripeCustomer;

    const existingUser = await Users.findOne({
      where: { id: authUserId },
    });

    if (existingUser.stripe_customer_id) {
      stripeCustomer = await stripe.customers.retrieve(
        existingUser.stripe_customer_id
      );
    } else {
      stripeCustomer = await stripe.customers.create({
        email: req.user.email,
        name: req.user.name,
        address: {
          line1: req.user.address,
          postal_code: req.user.postal_code,
          city: req.user.city,
          state: req.user.state,
          country: req.user.country,
        },
      });

      await Users.update(
        {
          stripe_customer_id: stripeCustomer.id,
        },
        {
          where: { id: authUserId },
        }
      );
    }

    const addedCard = await stripe.customers.createSource(stripeCustomer.id, {
      source: token,
    });

    const paymentCard = await Card.create({
      user_id: authUserId,
      stripe_card_id: addedCard.id,
      card_number: requestData.cardNumber,
      expiry_month: requestData.expMonth,
      expiry_year: requestData.expYear,
      cvc: requestData.cvc,
      cardholder_name: requestData.cardholderName,
    });

    return RESPONSE.success(res, 2401);
  } catch (error) {
    console.log(error);
    return RESPONSE.error(res, error.message);
  }
};

const createPayment = async (req, res) => {
  try {
    const authUserId = req.user.id;
    const cardId = req.body.cardId;
    const amount = req.body.amount;

    const user = await Users.findByPk(authUserId);
    const customerID = user.stripe_customer_id;

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      customer: customerID,
      payment_method: cardId,
      off_session: true,
      confirm: true,
      description: "testing",
      shipping: {
        name: req.user.name,
        address: {
          line1: req.user.address,
          postal_code: req.user.postal_code,
          city: req.user.city,
          state: req.user.state,
          country: req.user.country,
        },
      },
    });

    if (paymentIntent.status === "succeeded") {
      // Payment succeeded, you can save the payment details in your database
      const paymentDetails = {
        user_id: authUserId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        payment_intent_id: paymentIntent.id,
        payment_status: paymentIntent.status,
      };
      return RESPONSE.success(res, 2403, paymentIntent); // You can define your success response accordingly
    }
  } catch (error) {
    console.error(error);
    return RESPONSE.error(res, error.message);
  }
};

const deleteCard = async (req, res) => {
  try {
    const authUser = req.user.id;
    const id = req.params.id;
    // Find the card in your database
    const card = await Card.findOne({
      where: { stripe_card_id: id, user_id: authUser },
    });
    if (!card) {
      return RESPONSE.error(res, "Card not found");
    }

    const user = await Users.findOne({ where: { id: authUser } });

    const customerId = user.stripe_customer_id;

    if (!customerId) {
      return RESPONSE.error(res, "Stripe customer ID not found for the card");
    }

    const deleteCard1 = await stripe.customers.deleteSource(
      customerId,
      card.stripe_card_id
    );
    // console.log('deleteCard1', deleteCard1)

    const deleteCard = await card.destroy({ where: { id: id } });

    return RESPONSE.success(res, 1110);
  } catch (error) {
    console.error(error);
    return RESPONSE.error(res, error.message);
  }
};

const getCard = async (req, res) => {
  try {
    const {
      user: { id },
    } = req;
    const cards = await Card.findAll({
      where: { user_id: id },
    });

    if (!cards || cards.length === 0) {
      return RESPONSE.error(res, "No cards found for the user");
    }

    const stripeCustomer = await stripe.customers.retrieve(
      req.user.stripe_customer_id
    );
    // console.log('req.user.stripe_customer_id', req.user.stripe_customer_id)
    if (!stripeCustomer) {
      // console.log('stripeCustomer', stripeCustomer.default_source)
      return RESPONSE.error(res, "No default card found for the user");
    }

    const responseCards = [];

    for (const card of cards) {
      const cardDetails = await stripe.paymentMethods.retrieve(
        card.stripe_card_id
      );
      const { last4, brand } = cardDetails.card;

      const responseCard = {
        stripe_card_id: card.stripe_card_id,
        cardNumber: `${last4}`,
        type: `${brand}`,
      };

      responseCards.push(responseCard);
    }

    return RESPONSE.success(res, 2402, responseCards);
  } catch (error) {
    console.log(error);
    return RESPONSE.error(res, error.message);
  }
};

module.exports = {
  addCard,
  getCard,
  deleteCard,
  createPayment,
};
