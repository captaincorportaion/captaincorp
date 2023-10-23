const Validator = require('validatorjs');
const db = require("../config/db.config");
// const db = require('../models'); 
const Save = db.saves;
const Room = db.rooms;
const Event = db.event;
const Roommate = db.roommate;
const Item = db.items;
const RoomAmenitie = db.room_amenities;
const Media = db.media;
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
const Lifestyle = db.lifestyle
const SelectedSocial = db.selectedSocials
const SelectedInterest = db.selectedInterest
const SelectedLifestyle = db.selectedLifestyle;
const Item_categories = db.items_categories;
const Items_photos = db.item_photos;
// const { Sequelize, Op } = require('sequelize');

//add save post
const savePost = async (req, res) => {
    try {
        const { user: { id }, body: { roomId, eventId, roommateId, itemId } } = req;

        // const post = await Save.create({ user_id: id, roomId, eventId, roommateId, itemId })
        if (roomId) {

            const existingSavedRoom = await Save.findOne({ where: { user_id: id, roomId } });

            if (existingSavedRoom) {

                await Room.update(
                    { is_save: false },
                    { where: { id: roomId } }
                );
                await Save.destroy({ where: { user_id: id, roomId } });
                return RESPONSE.success(res, 1201);
            } else {

                const post = await Save.create({ user_id: id, roomId, post_category: "Room" });
                await Room.update(
                    { is_save: true },
                    { where: { id: roomId } }
                );
                return RESPONSE.success(res, 1204, post);
            }

        }
        if (eventId) {

            const existingSavedEvent = await Save.findOne({ where: { user_id: id, eventId } });

            if (existingSavedEvent) {

                await Event.update(
                    { is_save: false },
                    { where: { id: eventId } }
                );
                await Save.destroy({ where: { user_id: id, eventId } });
                return RESPONSE.success(res, 1205);
            } else {

                const post = await Save.create({ user_id: id, eventId, post_category: "Event" });
                await Event.update(
                    { is_save: true },
                    { where: { id: eventId } }
                );
                return RESPONSE.success(res, 1206, post);
            }
        }
        if (roommateId) {

            const existingSavedRoommte = await Save.findOne({ where: { user_id: id, roommateId } });

            if (existingSavedRoommte) {

                await Roommate.update(
                    { is_save: false },
                    { where: { id: roommateId } }
                );
                await Save.destroy({ where: { user_id: id, roommateId } });
                return RESPONSE.success(res, 1207);
            } else {
                const post = await Save.create({ user_id: id, roommateId, post_category: "Roommate" });
                await Roommate.update(
                    { is_save: true },
                    { where: { id: roommateId } }
                );
                return RESPONSE.success(res, 1208, post);
            }
        }
        if (itemId) {
            const existingSavedItem = await Save.findOne({ where: { user_id: id, itemId } });

            if (existingSavedItem) {
                await Item.update(
                    { is_save: false },
                    { where: { id: itemId } }
                );
                await Save.destroy({ where: { user_id: id, itemId } });
                return RESPONSE.success(res, 1209);
            } else {
                const post = await Save.create({ user_id: id, itemId, post_category: "Item" });
                await Item.update(
                    { is_save: true },
                    { where: { id: itemId } }
                );
                return RESPONSE.success(res, 1210, post);
            }
        }
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
};


const getSavePost = async (req, res) => {
    try {
        const { user: { id } } = req;
        const post = await Save.findAll({
            where: { user_id: id },
            include: [
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
                {
                    model: Roommate,
                    as: 'roommate',
                    include: [
                        {
                            model: Roommate_media,
                            attributes: ['media', 'id']
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
            ],
        })

        if (!post.length) {
            return RESPONSE.error(res, 1203);
        }
        // console.log(req.user.id);
        // console.log(post);
        return RESPONSE.success(res, 1202, post);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
};


module.exports = { savePost, getSavePost }
