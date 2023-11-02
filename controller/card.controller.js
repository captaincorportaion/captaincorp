const Validator = require("validatorjs");
const db = require('../config/db.config');
const Card = db.card;

const addCard = async (req, res) => {
    let validation = new Validator(req.body, {
        card_number: 'required|numeric',
        cvc: 'required|numeric',
        expiry_month: 'required|numeric',
        expiry_year: 'required|numeric',
        cardholder_name: 'required|alpha',
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { card_number, cvc, expiry_month, expiry_year, cardholder_name } = req.body;

        const authUser = req.user.id;

        const card = await Card.create({ user_id: authUser, card_number, cvc, expiry_month, expiry_year, cardholder_name });


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
