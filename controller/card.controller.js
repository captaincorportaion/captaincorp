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
        console.log('paymentCard', paymentCard)

        const updatedUser = await Users.update(
            {
                stripe_customer_id: stripeCustomer.id,
                stripe_card_id: stripeCustomer.default_source,
            },
            {
                where: { id: authUserId },
            }
        );
        return RESPONSE.success(res, 2401);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}

const deleteCard = async (req, res) => {
    try {
        const authUser = req.user.id;
        const id = req.params.id;
        const card = await Card.findOne({ where: { id: id, user_id: authUser } });
        if (!card) {
            return RESPONSE.error(res, 'card not found');
        }

        const deleteCard = await card.destroy({ where: { id: id } });

        return RESPONSE.success(res, 1110);
    } catch (error) {
        console.error(error);
        return RESPONSE.error(res, error.message);
    }
}

//get your all card
const getCard = async (req, res) => {
    try {
        const { user: { id } } = req;
        const card = await Card.findAll({
            where: { user_id: id }
        })
        return RESPONSE.success(res, 2402, card);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}


module.exports = {
    addCard,
    getCard,
    deleteCard
}
