const Validator = require('validatorjs');
const db = require("../config/db.config");
const { where } = require('sequelize');
// const db = require('../models'); 
const Users = db.users;
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
const Lifestyle = db.lifestyle;
const SelectedSocial = db.selectedSocials;
const SelectedInterest = db.selectedInterest;
const SelectedLifestyle = db.selectedLifestyle;
const Item_categories = db.items_categories;
const Items_photos = db.item_photos;
// const { Sequelize, Op } = require('sequelize');

//add save post
const savePost = async (req, res) => {
    try {
        const { user: { id }, body: { roomId, eventId, roommateId, itemId } } = req;

        if (roomId) {

            const existingSavedRoom = await Save.findOne({ where: { user_id: id, roomId } });

            if (existingSavedRoom) {
                const post = await Save.destroy({ where: { user_id: id, roomId } });
                const posts = {
                    post,
                    isSaved: false
                }
                return RESPONSE.success(res, 1201, posts);
            } else {
                const post = await Save.create({ user_id: id, roomId, post_category: "Room" });
                const posts = {
                    post,
                    isSaved: true
                }
                return RESPONSE.success(res, 1204, posts);
            }

        }
        if (eventId) {

            const existingSavedEvent = await Save.findOne({ where: { user_id: id, eventId } });

            if (existingSavedEvent) {
                const post = await Save.destroy({ where: { user_id: id, eventId } });
                const posts = {
                    post,
                    isSaved: false
                }
                return RESPONSE.success(res, 1205, posts);
            } else {
                const post = await Save.create({ user_id: id, eventId, post_category: "Event" });
                const posts = {
                    post,
                    isSaved: true
                }
                return RESPONSE.success(res, 1206, posts);
            }
        }
        if (roommateId) {

            const existingSavedRoommte = await Save.findOne({ where: { user_id: id, roommateId } });

            if (existingSavedRoommte) {
                const post = await Save.destroy({ where: { user_id: id, roommateId } });
                const posts = {
                    post,
                    isSaved: false
                }
                return RESPONSE.success(res, 1207, posts);
            } else {
                const post = await Save.create({ user_id: id, roommateId, post_category: "Roommate" });
                const posts = {
                    post,
                    isSaved: true
                }
                return RESPONSE.success(res, 1208, posts);
            }
        }
        if (itemId) {
            const existingSavedItem = await Save.findOne({ where: { user_id: id, itemId } });

            if (existingSavedItem) {
                const post = await Save.destroy({ where: { user_id: id, itemId } });
                const posts = {
                    post,
                    isSaved: false
                }
                return RESPONSE.success(res, 1209, posts);
            } else {
                const post = await Save.create({ user_id: id, itemId, post_category: "Item" });
                const posts = {
                    post,
                    isSaved: true
                }
                return RESPONSE.success(res, 1210, posts);
            }
        }

    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
};

// const savePost = async (req, res) => {
//     try {
//         const { user: { id }, body: { roomId, eventId, roommateId, itemId } } = req;

//         if (roomId) {
//             const existingSavedRoom = await Save.findOne({ where: { user_id: id, roomId } });

//             if (existingSavedRoom) {
//                 await Save.destroy({ where: { user_id: id, roomId } });
//                 const response = { ...RESPONSE.success(1201), is_save: false };
//                 return res.json(response);
//             } else {
//                 const post = await Save.create({ user_id: id, roomId, post_category: "Room" });
//                 const response = { ...RESPONSE.success(1204), is_save: true, post };
//                 return res.json(response);
//             }
//         }
//         if (eventId) {
//             const existingSavedEvent = await Save.findOne({ where: { user_id: id, eventId } });

//             if (existingSavedEvent) {
//                 await Save.destroy({ where: { user_id: id, eventId } });
//                 const response = { ...RESPONSE.success(1205), is_save: false };
//                 return res.json(response);
//             } else {
//                 const post = await Save.create({ user_id: id, eventId, post_category: "Event" });
//                 const response = { ...RESPONSE.success(1206), is_save: true, post };
//                 return res.json(response);
//             }
//         }
//         if (roommateId) {
//             const existingSavedRoommte = await Save.findOne({ where: { user_id: id, roommateId } });

//             if (existingSavedRoommte) {
//                 await Save.destroy({ where: { user_id: id, roommateId } });
//                 const response = { ...RESPONSE.success(1207), is_save: false };
//                 return res.json(response);
//             } else {
//                 const post = await Save.create({ user_id: id, roommateId, post_category: "Roommate" });
//                 const response = { ...RESPONSE.success(1208), is_save: true, post };
//                 return res.json(response);
//             }
//         }
//         if (itemId) {
//             const existingSavedItem = await Save.findOne({ where: { user_id: id, itemId } });

//             if (existingSavedItem) {
//                 await Save.destroy({ where: { user_id: id, itemId } });
//                 const responses = { ...RESPONSE.success(1209), is_save: false };
//                 return res.json(responses);
//             } else {
//                 const post = await Save.create({ user_id: id, itemId, post_category: "Item" });
//                 const response = { ...RESPONSE.success(res, 1210, post), is_save: true };
//                 return response;

//             }
//         }
//     } catch (error) {
//         console.log(error);
//         return RESPONSE.error(res, error.message);
//     }
// };



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
