const Validator = require("validatorjs");
const { Op } = require('sequelize');
const db = require('../config/db.config')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Card = db.card;
const Users = db.users;

const addCard = async (req, res) => {
    try {
        const requestData = req.body;

        const authUserId = req.user.id;
        const token = requestData.tokenId;
        // Your code to create a token
        // const token = await stripe.tokens.create({
        //     card: {
        //         number: requestData.cardNumber,
        //         exp_month: requestData.expMonth,
        //         exp_year: requestData.expYear,
        //         cvc: requestData.cvc,
        //     },
        // });

        // Your code to create a customer in Stripe
        const stripeCustomer = await stripe.customers.create({
            email: req.user.email,
            source: token,
            name: req.user.name,
            address: {
                line1: 'testing for prim',
                postal_code: requestData.zipCode,
                city: requestData.city,
                state: requestData.state,
                country: requestData.country,
                // line1: 'testing for prim',
                // postal_code: '395004',
                // city: 'surat',
                // state: 'gujrat',
                // country: 'india',
            },
        });

        const existingCard = await Card.findOne({
            where: {
                // user_id: authUserId,
                stripe_card_id: stripeCustomer.default_source,
                // card_number: requestData.cardNumber,
            },
        });

        if (existingCard) {
            return RESPONSE.error(res, "Card already exists for the user");
        }
        const paymentCard = await Card.create({
            user_id: authUserId,
            stripe_card_id: stripeCustomer.default_source,
            card_number: requestData.cardNumber,
            expiry_month: requestData.expMonth,
            expiry_year: requestData.expYear,
            cvc: requestData.cvc,
            cardholder_name: requestData.cardholderName,
        });
        // console.log('paymentCard', paymentCard)

        const updatedUser = await Users.update(
            {
                stripe_customer_id: stripeCustomer.id,
                stripe_card_id: stripeCustomer.default_source,
            },
            {
                where: { id: authUserId },
            }
        );

        // const setupIntent = await stripe.setupIntents.create({
        //     customer: stripeCustomer.id,
        //     usage: 'off_session',
        // });

        return RESPONSE.success(res, 2401);  // { clientSecret: setupIntent.client_secret }
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}

const createPayment = async (req, res) => {
    try {
        const authUserId = req.user.id;
        const cardId = req.body.cardId;
        const amount = req.body.amount;

        // Retrieve the user's Stripe customer ID from your database
        const user = await Users.findByPk(authUserId);
        const customerID = user.stripe_customer_id;
        // const setupIntentConfirmation = await stripe.setupIntents.confirm(
        //     req.body.setupIntentClientSecret,
        //     { payment_method: cardId }
        // );
        // Create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            // amount: amount,
            // currency: 'usd',
            // customer: customerID,
            // payment_method: cardId,
            // off_session: true,
            // confirm: true,
            // description:"testing",
            // customer:"cus_PDoidR16F235NF"
            amount: amount,
            currency: 'inr',
            customer: customerID,
            payment_method: cardId,
            off_session: true,
            confirm: true,
            description: "testing",
            shipping: {
                name: req.user.name,
                address: {
                    line1: 'testing for prim',
                    postal_code: req.body.zipCode,
                    city: req.body.city,
                    state: req.body.state,
                    country: req.body.country,
                },
            },
        });
        // if (paymentIntent.currency !== 'inr' && req.body.country === 'IN') {
        //     return RESPONSE.error(res, "Non-INR transactions in India should have shipping/billing address outside Indiaaaaa");
        // }
        // Handle the PaymentIntent status
        if (paymentIntent.status === 'succeeded') {
            // Payment succeeded, you can save the payment details in your database
            const paymentDetails = {
                user_id: authUserId,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                payment_intent_id: paymentIntent.id,
                payment_status: paymentIntent.status,
            };
            // YourPaymentModel.create(paymentDetails);
            return RESPONSE.success(res, 2403, paymentIntent); // You can define your success response accordingly
        }
        //  else {
        //     // Payment failed, handle the error
        //     return RESPONSE.error(res, `Payment failed: ${paymentIntent.last_payment_error ? paymentIntent.last_payment_error.message : 'Unknown error'}`);
        // }
    } catch (error) {
        console.error(error);
        return RESPONSE.error(res, error.message);
    }
};

// const createPaymentMethod = async (req, res) => {
//     try {
//         const requestData = req.body;
//         const authUserId = req.user.id;
//         const token = requestData.tokenId;
//         // Create a Payment Method using the Stripe API
//         const paymentMethod = await stripe.paymentMethods.create({
//             type: 'card',
//             source: token,
//             card: {
//                 token: requestData.token, // Use the token generated by Stripe.js
//             },

//         });

//         // Attach the Payment Method to the customer (assumes you have a Stripe customer ID in your Users model)
//         const user = await Users.findByPk(authUserId);
//         const customerID = user.stripe_customer_id;

//         await stripe.paymentMethods.attach(paymentMethod.id, {
//             customer: customerID,
//         });

//         return RESPONSE.success(res, 2402, { paymentMethodId: paymentMethod.id });
//     } catch (error) {
//         console.error(error);
//         return RESPONSE.error(res, error.message);
//     }
// };


// const deleteCard = async (req, res) => {
//     try {
//         const authUser = req.user.id;
//         const id = req.params.id;
//         const card = await Card.findOne({ where: { id: id, user_id: authUser } });
//         if (!card) {
//             return RESPONSE.error(res, 'card not found');
//         }

//         const deleteCard = await card.destroy({ where: { id: id } });

//         return RESPONSE.success(res, 1110);
//     } catch (error) {
//         console.error(error);
//         return RESPONSE.error(res, error.message);
//     }
// }

const deleteCard = async (req, res) => {
    try {
        const authUser = req.user.id;
        const id = req.params.id;
        // Find the card in your database
        const card = await Card.findOne({ where: { stripe_card_id: id, user_id: authUser } });
        if (!card) {
            return RESPONSE.error(res, 'Card not found');
        }

        const user = await Users.findOne({ where: { id: authUser } })

        const customerId = user.stripe_customer_id; 

        if (!customerId) {
            return RESPONSE.error(res, 'Stripe customer ID not found for the card');
        }

        await stripe.customers.deleteSource(customerId, card.stripe_card_id); 

        const deleteCard = await card.destroy({ where: { id: id } });

        return RESPONSE.success(res, 1110);
    } catch (error) {
        console.error(error);
        return RESPONSE.error(res, error.message);
    }
}


// const getCard = async (req, res) => {
//     try {
//         const { user: { id } } = req;
//         const cards = await Card.findAll({
//             where: { user_id: id }
//         });

//         if (cards || cards.length === 0) {
//             const stripeCustomer = await stripe.customers.retrieve(req.user.stripe_customer_id);
//             if (!stripeCustomer || !stripeCustomer.default_source) {
//                 return RESPONSE.error(res, "No cards found for the user");
//             }

//             const cardDetails = await stripe.paymentMethods.retrieve(stripeCustomer.default_source);

//             const { last4 } = cardDetails.card;

//             const responseCard = {
//                 // cards,
//                 cardNumber: `${last4}`,
//             };

//             return RESPONSE.success(res, 2402, responseCard);
//         }

//         return RESPONSE.success(res, 2402, cards);
//     } catch (error) {
//         console.log(error);
//         return RESPONSE.error(res, error.message);
//     }
// }

const getCard = async (req, res) => {
    try {
        const { user: { id } } = req;
        const cards = await Card.findAll({
            where: { user_id: id }
        });

        if (!cards || cards.length === 0) {
            return RESPONSE.error(res, "No cards found for the user");
        }

        const stripeCustomer = await stripe.customers.retrieve(req.user.stripe_customer_id);
        if (!stripeCustomer || !stripeCustomer.default_source) {
            return RESPONSE.error(res, "No default card found for the user");
        }

        const responseCards = [];

        for (const card of cards) {
            const cardDetails = await stripe.paymentMethods.retrieve(card.stripe_card_id);
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
}
