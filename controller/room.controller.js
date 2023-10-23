const Validator = require('validatorjs');
const db = require("../config/db.config");
const { Sequelize, Op } = require('sequelize');
const Users = db.users;
const roomAmenitie = db.room_amenities;
const Media = db.media;
const roomRules = db.room_rules;
const Room = db.rooms;
const Houserules = db.houseRules;
const Houseamenities = db.houseAmenities;

// const imageUpload = require('../helpers/file')
// const videoUpload = require('../helpers/file')

//get all house amenities
const getAllamenities = async (req, res) => {
    try {
        const roomAmenities = await Houseamenities.findAll();

        return RESPONSE.success(res, 1107, roomAmenities);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}


//get all house rules
const getAllrules = async (req, res) => {
    try {
        const room = await Houserules.findAll();

        return RESPONSE.success(res, 1102, room);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}


//add new room
const addRooms = async (req, res) => {
    // console.log('req.body', req.body)
    //validation
    let validation = new Validator(req.body, {
        title: 'required|string',
        description: 'required|string',
        type: 'required|in:Any,Shared room,Private room,Student accommodation',
        bedRooms: 'required',
        address: 'required',
        bathRooms: 'required',
        tenant: 'required',
        liveWith: 'required|in:Both,Male,Female',
        amenities: 'required',
        rules: 'required',
        prefereOccupation: 'required|in:Student,Employee,Worker',
        availibility: 'required',
        monthlyRent: 'required|numeric',
        minimumStay: 'required|numeric',
        roomSize: 'required|numeric',
        city: 'required|string',
        lat: 'required',
        lng: 'required',
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }

    try {
        const authUser = req.user.id;
        const {
            title,
            description,
            bedRooms,
            bathRooms,
            tenant,
            address,
            liveWith,
            amenities,
            rules,
            type,
            prefereOccupation,
            availibility,
            monthlyRent,
            minimumStay,
            roomSize,
            extraBills,
            city,
            lat,
            lng
        } = req.body;

        // if aminities is not in array formate then throw error
        if (amenities && amenities.length < 0) {
            return RESPONSE.error(res, 1103)
        }

        // if rules is not in array formate then throw error
        if (rules && rules.length < 0) {
            return RESPONSE.error(res, 1103)
        }

        let mediaImg;
        if (typeof req.files !== 'undefined' && req.files.length > 0) {
            if (req.files[0].fieldname == 'mediaUrl') {
                mediaImg = await FILEACTION.imageUpload(req.files, 'room_image');
            }
        }

        let mediaVideo;
        if (typeof req.files !== 'undefined' && req.files.length > 0) {
            if (req.files[0].fieldname == 'mediaVideo') {
                mediaVideo = await FILEACTION.videoUpload(req.files, 'video');
            }
        }

        const newRoom = await Room.create({
            user_id: authUser,
            title,
            description,
            bedRooms,
            bathRooms,
            address,
            tenant,
            type,
            liveWith,
            prefereOccupation,
            availibility,
            monthlyRent,
            minimumStay,
            roomSize,
            extraBills,
            city,
            lat,
            lng,
        });
        let responseData = null;
        responseData = newRoom.toJSON();

        // create aminities in array of object formate for bulk create
        if (amenities != '' && typeof amenities != 'undefined') {
            let amenitieData = amenities.map((item) => {
                // console.log('item', typeof (item))
                return {
                    amenitieId: item,
                    roomId: newRoom.id,
                }
            })
            // let amenitieData = JSON.parse(amenities).map((item) => {
            //     // console.log('item', typeof (item))
            //     return {
            //         amenitieId: item,
            //         roomId: newRoom.id,
            //     }
            // })
            // console.log("amenitieData",amenitieData);

            const createAmenities = await roomAmenitie.bulkCreate(amenitieData, {
                returning: true
            });
            // console.log('createAmenities', createAmenities)
            responseData.room_amenities = createAmenities
        }

        // create rules in array of object formate for bulk create
        if (rules != '' && typeof rules != 'undefined') {
            let rulesData = rules.map((item) => {
                return {
                    rulesId: item,
                    roomId: newRoom.id,
                }
            })

            const createRules = await roomRules.bulkCreate(rulesData, {
                returning: true
            });
            responseData.room_rules = createRules
        }

        let mediaData = [];

        if (typeof req.files !== 'undefined' && req.files.length > 0) {
            const isWorkspaceImg = req.files.some((item) => item.fieldname === 'mediaImg');
            const isWorkspaceVideo = req.files.some((item) => item.fieldname === 'mediaVideo');

            if (isWorkspaceImg || isWorkspaceVideo) {
                let workspace_imageArr = [];

                if (isWorkspaceImg) {
                    workspace_imageArr = await FILEACTION.imageUpload(req.files, 'room_image');
                    const mediaDataImg = workspace_imageArr.map((item) => ({
                        type: 1, // image
                        roomId: newRoom.id,
                        url: `/room_image/${item}`
                    }));
                    mediaData.push(...mediaDataImg);
                }

                if (isWorkspaceVideo) {
                    workspace_imageArr = await FILEACTION.videoUpload(req.files, 'video');
                    const mediaDataVideo = workspace_imageArr.map((item) => ({
                        type: 2, // video
                        roomId: newRoom.id,
                        url: `/video/${item}`
                    }));
                    mediaData.push(...mediaDataVideo);
                }

                if (mediaData.length > 0) {
                    const createMedia = await Media.bulkCreate(mediaData, {
                        returning: true
                    });

                    responseData.media = createMedia;
                }
            }
        }
        const findRoom = await Room.findOne({
            where: { id: newRoom.id },
            include: [
                {
                    model: Media,
                    as: 'media',
                },
                {
                    model: roomAmenitie,
                    as: 'roomAmenities',
                    include: [
                        {
                            model: Houseamenities,
                            as: 'houseamenitie',
                            attributes: ['name', 'id']
                        }
                    ]
                },
                {
                    model: roomRules,
                    as: 'roomRules',
                    include: [
                        {
                            model: Houserules,
                            as: 'houserules',
                            attributes: ['name', 'id']
                        }
                    ]
                }
            ],
        })


        return RESPONSE.success(res, 1101);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }

}

//update room
const updateRoom = async (req, res) => {
    try {
        const authUser = req.user.id;
        const roomId = req.params.id;

        const room = await Room.findOne({ where: { id: roomId, user_id: authUser } });

        if (!room) {
            return RESPONSE.error(res, 'Room not found');
        }

        const {
            title,
            description,
            bedRooms,
            bathRooms,
            tenant,
            liveWith,
            amenities,
            rules,
            type,
            prefereOccupation,
            availibility,
            monthlyRent,
            minimumStay,
            roomSize,
            extraBills,
            city,
            lat,
            lng
        } = req.body;

        // if aminities is not in array formate then throw error
        if (amenities && amenities.length < 0) {
            return RESPONSE.error(res, 1103)
        }

        // if rules is not in array formate then throw error
        if (rules && rules.length < 0) {
            return RESPONSE.error(res, 1103)
        }


        // upload image on server and get path for store in database

        // console.log('mediaUrl', mediaUrl)
        // console.log(req.files);
        let mediaImg;
        if (typeof req.files !== 'undefined' && req.files.length > 0) {
            if (req.files[0].fieldname == 'mediaUrl') {
                mediaImg = await FILEACTION.imageUpload(req.files, 'room_image');
            }
        }

        let mediaVideo;
        if (typeof req.files !== 'undefined' && req.files.length > 0) {
            if (req.files[0].fieldname == 'mediaVideo') {
                mediaVideo = await FILEACTION.videoUpload(req.files, 'video');
            }
        }

        const newRoom = await room.update({
            title,
            description,
            bedRooms,
            bathRooms,
            tenant,
            type,
            liveWith,
            prefereOccupation,
            availibility,
            monthlyRent,
            minimumStay,
            roomSize,
            extraBills,
            city,
            lat,
            lng,
        });
        // console.log('newRoom', newRoom)
        let responseData = null;
        responseData = newRoom.toJSON();

        // create aminities in array of object formate for bulk create
        if (amenities) {
            // Delete existing amenities associated with the room
            await roomAmenitie.destroy({
                where: { roomId }
            });

            // Create new amenities
            const amenitieData = JSON.parse(amenities).map((item) => {
                return {
                    amenitieId: item,
                    roomId
                }
            });

            const createAmenities = await roomAmenitie.bulkCreate(amenitieData, { returning: true });
            responseData.room_amenities = createAmenities;
        }

        // create rules in array of object formate for bulk create
        if (rules) {
            // Delete existing rules associated with the room
            await roomRules.destroy({
                where: { roomId }
            });

            // Create new rules
            const rulesData = JSON.parse(rules).map((item) => {
                return {
                    rulesId: item,
                    roomId
                }
            });

            const createRules = await roomRules.bulkCreate(rulesData);
            responseData.room_rules = createRules
        }


        let mediaData = [];

        if (typeof req.files !== 'undefined' && req.files.length > 0) {
            const isWorkspaceImg = req.files.some((item) => item.fieldname === 'mediaImg');
            const isWorkspaceVideo = req.files.some((item) => item.fieldname === 'mediaVideo');

            if (isWorkspaceImg || isWorkspaceVideo) {
                let workspace_imageArr = [];

                if (isWorkspaceImg) {
                    workspace_imageArr = await FILEACTION.imageUpload(req.files, 'room_image');
                    const mediaDataImg = workspace_imageArr.map((item) => ({
                        type: 1, // image
                        roomId: newRoom.id,
                        url: `/room_image/${item}`
                    }));
                    mediaData.push(...mediaDataImg);
                }

                if (isWorkspaceVideo) {
                    workspace_imageArr = await FILEACTION.videoUpload(req.files, 'video');
                    const mediaDataVideo = workspace_imageArr.map((item) => ({
                        type: 2, // video
                        roomId: newRoom.id,
                        url: `/video/${item}`
                    }));
                    mediaData.push(...mediaDataVideo);
                }

                if (mediaData.length > 0) {
                    const createMedia = await Media.bulkCreate(mediaData, {
                        returning: true
                    });

                    responseData.media = createMedia;
                }
            }
        }


        return RESPONSE.success(res, 1109);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}

//delete room
const deleteRoom = async (req, res) => {
    try {
        const authUser = req.user.id;
        const id = req.params.id;
        const room = await Room.findOne({ where: { id: id, user_id: authUser } });
        if (!room) {
            return RESPONSE.error(res, 'room not found');
        }

        const media = await room.destroy({ where: { id: id } });

        return RESPONSE.success(res, 1110);
    } catch (error) {
        console.error(error);
        return RESPONSE.error(res, error.message);
    }
}

//delete media by id
const deleteMedia = async (req, res) => {
    try {
        const ids = req.body.id;
        const authUser = req.user.id;
        const deletedMedia = [];

        const roomIds = await Media.findAll({
            where: { id: ids },
            attributes: ['roomId'],
        });

        for (const room of roomIds) {
            const roomId = room.roomId;

            const associatedItem = await Room.findOne({
                where: { id: roomId, user_id: authUser },
            });

            if (associatedItem) {
                await Media.destroy({ where: { id: ids } });
                deletedMedia.push(room.id);
            } else {
                return RESPONSE.error(res, "You are not allowed to delete this photo");
            }
        }

        return RESPONSE.success(res, 1110);
    } catch (error) {
        console.error(error);
        return RESPONSE.error(res, error.message);
    }
}

//get All rooms
const getAllRooms = async (req, res) => {
    let validation = new Validator(req.query, {
        // item_type: 'required|in:Roommate,Housemate',
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { city, bedRooms, bathRooms, tenant, availibility, minimumStay, liveWith, max_budget, min_budget, type } = req.query;
        let condition = {}

        if (Object.keys(req.query).length === 0) {
            const rooms = await Room.findAll({
                include: [
                    {
                        model: Media,
                        as: 'media',
                    },
                    {
                        model: roomAmenitie,
                        as: 'roomAmenities',
                        include: [
                            {
                                model: Houseamenities,
                                as: 'houseamenitie'
                            }
                        ]
                    },
                    {
                        model: roomRules,
                        as: 'roomRules',
                        include: [
                            {
                                model: Houserules,
                                as: 'houserules'
                            }
                        ]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            return RESPONSE.success(res, 1104, rooms);
        }

        if (city) {
            condition.city = city;
        }

        if (bedRooms) {
            condition.bedRooms = bedRooms;
        }

        if (bathRooms) {
            condition.bathRooms = bathRooms;
        }

        if (tenant) {
            condition.tenant = tenant;
        }

        if (min_budget && max_budget) {
            condition.monthlyRent = { [Op.gte]: min_budget, [Op.lte]: max_budget }
        }

        if (availibility) {
            condition.availibility = { [Op.gte]: new Date(availibility) };
        }

        if (minimumStay) {
            condition.minimumStay = { [Op.lte]: parseInt(minimumStay) };
        }

        if (liveWith) {
            condition.liveWith = liveWith;
        }

        const rooms = await Room.findAll({
            where: condition,
            include: [
                {
                    model: Media,
                    as: 'media',
                },
                {
                    model: roomAmenitie,
                    as: 'roomAmenities',
                    include: [
                        {
                            model: Houseamenities,
                            as: 'houseamenitie'
                        }
                    ]
                },
                {
                    model: roomRules,
                    as: 'roomRules',
                    include: [
                        {
                            model: Houserules,
                            as: 'houserules'
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        if (!rooms.length) {
            return RESPONSE.error(res, 1105);
        }

        return RESPONSE.success(res, 1104, rooms);

    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}


//get your All room
const getRoom = async (req, res) => {
    try {
        const { user: { id } } = req;
        const event = await Room.findAll({
            where: { user_id: id },
            include: [
                {
                    model: Media,
                    as: 'media',
                },
                {
                    model: roomAmenitie,
                    as: 'roomAmenities',
                    include: [
                        {
                            model: Houseamenities,
                            as: 'houseamenitie'
                        }
                    ]
                },
                {
                    model: roomRules,
                    as: 'roomRules',
                    include: [
                        {
                            model: Houserules,
                            as: 'houserules'
                        }
                    ]
                },
            ],
            order: [['createdAt', 'DESC']]
        })

        return RESPONSE.success(res, 1104, event);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}

const getAllRoomsById = async (req, res) => {
    let validation = new Validator(req.query, {
        id: 'required',
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { id } = req.query;

        const rooms = await Room.findByPk(id, {
            include: [
                {
                    model: Media,
                    as: 'media',
                },
                {
                    model: roomAmenitie,
                    as: 'roomAmenities',
                    include: [
                        {
                            model: Houseamenities,
                            as: 'houseamenitie',
                            attributes: ['id', 'name', 'amenities_img'],
                        }
                    ]
                },
                {
                    model: roomRules,
                    as: 'roomRules',
                    include: [
                        {
                            model: Houserules,
                            as: 'houserules',
                        }
                    ]
                },
                {
                    model: Users,
                    attributes: ['name', 'picture']
                }
            ],
        });

        if (!rooms) {
            return RESPONSE.error(res, 1105);
        }

        return RESPONSE.success(res, 1104, rooms);

    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}


module.exports = {
    addRooms,
    getAllRooms,
    getAllRoomsById,
    getRoom,
    getAllamenities,
    getAllrules,
    updateRoom,
    deleteMedia,
    deleteRoom
}
