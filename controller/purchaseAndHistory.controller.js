const Validator = require("validatorjs");
const { Op } = require('sequelize');
const db = require('../config/db.config')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Card = db.card;
const Users = db.users;
const Rent_item_booking = db.rent_item_booking;
const Sale_item_booking = db.sale_item_booking;
const Room_booking = db.room_booking
const Roommate_booking = db.roommate_booking;
const Event_booking = db.event_booking;
const User = db.users
const Room = db.rooms;
const Event = db.event;
const Roommate = db.roommate;
const Item = db.items;
const Media = db.media;
const RoomAmenitie = db.room_amenities;
const RoomRules = db.room_rules;
const Houserules = db.houseRules;
const Houseamenities = db.houseAmenities;
const Selected_amenities = db.selected_amenities;
const Event_photos = db.event_photos;
const Event_categories = db.event_categories;
const Event_amenities = db.event_amenities;
const Roommate_media = db.roommate_media;
const Roommate_social = db.roommate_socials;
const Roommate_interests = db.roommate_interests;
const Lifestyle = db.lifestyle;
const SelectedSocial = db.selectedSocials;
const SelectedInterest = db.selectedInterest;
const SelectedLifestyle = db.selectedLifestyle;
const Item_categories = db.items_categories;
const Items_photos = db.item_photos;

const updateStatusafterPaymentData = async (req, res) => {
    let validation = new Validator(req.query, {
        status: 'required|in:Accept',
        id: 'required',
        type: 'required|in:Room,Roommate,saleItem,Event'
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

        } else if (type == "rentItem") {

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

        } else if (type == "saleItem") {
            const findData = await Sale_item_booking.findOne({
                where: { id, status: "Pending" }, include: {
                    model: User,
                    as: 'user',
                }
            });
            if (!findData) {
                return RESPONSE.error(res, 1012);
            }

            await Sale_item_booking.update({ status: status }, { where: { id: findData.id } });
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


//get updateStatusafterPayment data
const updateStatusafterPayment = async (req, res) => {
    try {
        const { user: { id } } = req;
        const RoomData = await Room_booking.findAll({
            where: { user_id: id, status: "Accept" }, include: [
                {
                    model: Room,
                    as: 'room',
                    include: [
                        {
                            model: Media,
                            as: 'media',
                        },
                        {
                            model: RoomAmenitie,
                            as: 'roomAmenities',
                            include: [
                                {
                                    model: Houseamenities,
                                    as: 'houseamenitie'
                                }
                            ]
                        },
                        {
                            model: RoomRules,
                            as: 'roomRules',
                            include: [
                                {
                                    model: Houserules,
                                    as: 'houserules'
                                }
                            ]
                        },
                    ]
                },
                {
                    model: User,
                    attributes: ['name', 'picture']
                }
            ]
        }
        );
        const RoommateData = await Roommate_booking.findAll({
            where: { user_id: id, status: "Accept" }, include: [
                {
                    model: Roommate,
                    as: 'roommate',
                    include: [
                        {
                            model: Roommate_media,
                            attributes: ['media', 'id']
                        },
                        {
                            model: Users,
                            attributes: ['name', 'picture']
                        },
                        {
                            model: SelectedInterest,
                            attributes: ['interest_id', 'id'],
                            include: [
                                {
                                    model: Roommate_interests,
                                    attributes: ['name', 'id']
                                }
                            ],
                        },

                        {
                            model: SelectedSocial,
                            attributes: ['social_id', 'id'],
                            include: [
                                {
                                    model: Roommate_social,
                                    attributes: ['name', 'id']
                                }
                            ],
                        },
                        {
                            model: SelectedLifestyle,
                            attributes: ['lifestyle_id', 'id'],
                            as: 'selectedLifestyles',
                            include: [
                                {
                                    model: Lifestyle,
                                    attributes: ['name', 'id']
                                }
                            ],
                        },
                    ],
                },
            ]
        });
        const ItemData = await Rent_item_booking.findAll({
            where: { user_id: id, status: "Accept" }, include: [
                {
                    model: Item,
                    as: 'item',
                    include: [
                        {
                            model: Items_photos,
                            attributes: ['photo', 'id']
                        },
                        {
                            model: Item_categories,
                            attributes: ['name', 'id']
                        },
                    ],

                }
            ]
        });
        const saleItemData = await Sale_item_booking.findAll({
            where: { user_id: id, status: "Accept" }, include: [
                {
                    model: Item,
                    as: 'item',
                    include: [
                        {
                            model: Items_photos,
                            attributes: ['photo', 'id']
                        },
                        {
                            model: Item_categories,
                            attributes: ['name', 'id']
                        },
                    ],

                }
            ]
        });
        const EventData = await Event_booking.findAll({
            where: { user_id: id, status: "Accept" }, include: [
                {
                    model: Event,
                    as: 'event',
                    include: [
                        {
                            model: Event_photos,
                            attributes: ['photo', 'id']
                        },
                        {
                            model: Event_categories,
                            attributes: ['name', 'id']
                        },
                        {
                            model: Selected_amenities,
                            attributes: ['event_amenities_id', 'id'],
                            include: [
                                {
                                    model: Event_amenities,
                                    attributes: ['name', 'id']
                                }
                            ]
                        }
                    ],
                },
            ]
        });

        const response = { RoomData, RoommateData, ItemData, EventData, saleItemData }

        return RESPONSE.success(res, 2501, response);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}

module.exports = {
    updateStatusafterPayment, updateStatusafterPaymentData
}