const Validator = require("validatorjs");
const { Op } = require('sequelize');
const db = require('../config/db.config')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Card = db.card;
const Users = db.users;
const Rent_item_booking = db.rent_item_booking;
const Room_booking = db.room_booking
const Roommate_booking = db.roommate_booking;
const Event_booking = db.event_booking;
const User = db.users



const updateStatusafterPaymentData = async (req, res) => {
    let validation = new Validator(req.query, {
        status: 'required|in:confirm',
        id: 'required',
        type: 'required|in:Room,Roommate,Item,Event'
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { status, id, type } = req.query;

        const authUser = req.user;

        if (type == "Room") {
            const findData = await Room_booking.findOne({
                where: { id }, include: {
                    model: User,
                    as: 'user',
                }
            });
            if (!findData) {
                return RESPONSE.error(res, 1012);
            }

            await Room_booking.update({ status: status }, { where: { id: findData.id } });

        } else if (type == "Roommate") {
            const findData = await Roommate_booking.findOne({
                where: { id }, include: {
                    model: User,
                    as: 'user',
                }
            });
            if (!findData) {
                return RESPONSE.error(res, 1012);
            }

            await Roommate_booking.update({ status: status }, { where: { id: findData.id } });

        } else if (type == "Item") {

            const findData = await Rent_item_booking.findOne({
                where: { id, status: "Pending" }, include: {
                    model: User,
                    as: 'user',
                }
            });
            if (!findData) {
                return RESPONSE.error(res, 1012);
            }

            await Rent_item_booking.update({ status: status }, { where: { id: findData.id } });

        } else {
            const findData = await Event_booking.findOne({
                where: { id, status: "Pending" }, include: {
                    model: User,
                    as: 'user',
                }
            });
            if (!findData) {
                return RESPONSE.error(res, 1012);
            }

            await Event_booking.update({ status: status }, { where: { id: findData.id } });
        }

        return RESPONSE.success(res, 2502);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
};


const updateStatusafterPayment = async (req, res) => {
    try {
        const { user: { id } } = req;
        const RoomData = await Room_booking.findAll({
            where: { user_id: id, status: "confirm" }, include: {
                model: User,
                as: 'user',
            }
        });
        const RoommateData = await Roommate_booking.findAll({
            where: { user_id: id, status: "confirm" }, include: {
                model: User,
                as: 'user',
            }
        });
        const ItemData = await Rent_item_booking.findAll({
            where: { user_id: id, status: "confirm" }, include: {
                model: User,
                as: 'user',
            }
        });
        const EventData = await Event_booking.findAll({
            where: { user_id: id, status: "confirm" }, include: {
                model: User,
                as: 'user',
            }
        });

        const response = { RoomData, RoommateData, ItemData, EventData }

        return RESPONSE.success(res, 2501, response);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}

module.exports = {
    updateStatusafterPayment, updateStatusafterPaymentData
}