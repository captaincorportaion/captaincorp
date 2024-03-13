const Validator = require("validatorjs");
const db = require('../config/db.config');
const { Op } = require('sequelize')
const randomstring = require('randomstring')
const { sendNotification } = require("../helpers/firebase")

//...................models............
const Roommate = db.roommate;
const Users = db.users;
const Roommate_media = db.roommate_media;
const Roommate_social = db.roommate_socials;
const Roommate_interests = db.roommate_interests;
const Lifestyle = db.lifestyle;
const SelectedSocial = db.selectedSocials;
const SelectedInterest = db.selectedInterest;
const SelectedLifestyle = db.selectedLifestyle;
const Roommate_booking = db.roommate_booking;
const SavedPost = db.saves

const { uploadRoommateFiles, UploadFiles } = require('../helpers/file')


//get all lifestyle
const getAllLifestyle = async (req, res) => {
    try {
        const selectedLifestyle = await Lifestyle.findAll();

        return RESPONSE.success(res, 2206, selectedLifestyle);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}

//get all interset
const getAllSocialmedia = async (req, res) => {
    try {
        const selectedSocial = await Roommate_social.findAll();
        return RESPONSE.success(res, 2207, selectedSocial);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}

const getAllInterest = async (req, res) => {
    try {
        const selectedInterest = await Roommate_interests.findAll();

        return RESPONSE.success(res, 2208, selectedInterest);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}

//...............add roommate...............
const addRoommate = async (req, res) => {
    let validation = new Validator(req.body, {
        city: 'required|string',
        lat: 'required',
        long: 'required',
        gender: 'required|in:Male,Female,Other',
        Occupation: 'required|string',
        food_choice: 'required|in:Vegetarian,Non-Vegetarian',
        religion: 'required|in:Hindu,Muslim,Christianity,Buddhism,Other',
        monthly_rent: 'required|numeric',
        minimum_stay: 'required|numeric',
        bathrooms: 'required|numeric',
        bedrooms: 'required|numeric',
        no_of_roommates: 'required|numeric',
        marital_status: 'required|in:Single,Married',
        gender_preference: 'required|in:Male,Female,Other',
        preference_food_choice: 'required|in:Vegetarian,Non-Vegetarian',
        preference_age: 'required|in:12-18 Year,18-35 Year,35-50 Year',
        message: 'required|string',
        interest_id: 'required|array',
        social_id: 'required|array',
        lifestyle_id: 'required|array',
        address: 'required|string',
        bed_time: 'required'
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { city, lat, long, address, gender, Occupation, food_choice, religion, bed_time, monthly_rent, minimum_stay, bathrooms, bedrooms, no_of_roommates, marital_status, gender_preference, preference_food_choice, preference_age, interest_id, social_id, lifestyle_id, message } = req.body;
        const authUser = req.user.id
        const addRoommate = await Roommate.create({ user_id: authUser, city, lat, long, address, bed_time, gender, Occupation, food_choice, religion, monthly_rent, minimum_stay, bathrooms, bedrooms, no_of_roommates, marital_status, gender_preference, preference_food_choice, preference_age, message })
        if (addRoommate) {
            for (const selectedInterest of interest_id) {
                await SelectedInterest.create({
                    roommate_id: addRoommate.id,
                    interest_id: selectedInterest
                });
            }
            for (const selectedSocial of social_id) {
                await SelectedSocial.create({
                    roommate_id: addRoommate.id,
                    social_id: selectedSocial
                });
            }
            for (const selectedLifestyle of lifestyle_id) {
                await SelectedLifestyle.create({
                    roommate_id: addRoommate.id,
                    lifestyle_id: selectedLifestyle
                });
            }
            //.................upload media ..............
            let mediaUrl = [];
            if (typeof req.files !== 'undefined' && req.files.length > 0) {
                mediaUrl = await uploadRoommateFiles(req.files, 'images/roommate_media');
            }
            for (const i of mediaUrl) {
                await Roommate_media.create({
                    roommate_id: addRoommate.id,
                    media: i.roommate_media,
                    media_type: i.media_type
                })
            }
        }
        const findRoommate = await Roommate.findOne({
            where: { id: addRoommate.id },
            include: [
                {
                    model: Roommate_media,
                    attributes: ['media', 'id', 'media_type']
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
                {
                    model: Users,
                    attributes: ['name']
                }
            ],
        });
        return RESPONSE.success(res, 2201, findRoommate);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}

//...............add roommate...............
const updateRoommate = async (req, res) => {
    try {
        const authUser = req.user.id;
        const roommateId = req.params.id;


        const roommate = await Roommate.findOne({ where: { id: roommateId, user_id: authUser } });
        if (!roommate) {
            return RESPONSE.error(res, 'Roommate not found');
        }
        const { city, lat, long, gender, age, Occupation, food_choice, religion, monthly_rent, minimum_stay, bathrooms, bedrooms, bed_time, no_of_roommates, required_roommate, marital_status, gender_preference, preference_food_choice, preference_age, lifestyle, interest_id, social_id, lifestyle_id, message } = req.body;

        if (interest_id && interest_id.length < 0) {
            return RESPONSE.error(res, 1103)
        }

        if (social_id && social_id.length < 0) {
            return RESPONSE.error(res, 1103)
        }

        if (lifestyle_id && lifestyle_id.length < 0) {
            return RESPONSE.error(res, 1103)
        }
        let photo = [];
        if (typeof req.files !== 'undefined' && req.files.length > 0) {

            const data = req.files.filter((item) => item.fieldname == "image")
            // if (data.length > 1) {
            //     return RESPONSE.error(res, 2202)
            // }
            photo = await UploadFiles(data, 'images/roommate_media', 'image');
        }

        const updateRoommate = await roommate.update({ image: photo[0], city, lat, age, long, gender, Occupation, bed_time, food_choice, religion, monthly_rent, minimum_stay, bathrooms, bedrooms, no_of_roommates, required_roommate, marital_status, gender_preference, preference_food_choice, preference_age, lifestyle, message })

        let responseData = null
        responseData = updateRoommate.toJSON();

        if (updateRoommate) {
            if (interest_id) {
                await SelectedInterest.destroy({
                    where: { roommate_id: roommateId }
                });

                const interestData = JSON.parse(interest_id).map((item) => {
                    return {
                        interest_id: item,
                        roommate_id: roommateId
                    }
                });
                const createdinterest = await SelectedInterest.bulkCreate(interestData);
                responseData.selectedInterest = createdinterest
            }


            if (social_id) {
                await SelectedSocial.destroy({
                    where: { roommate_id: roommateId }
                });

                const socialData = JSON.parse(social_id).map((item) => {
                    return {
                        social_id: item,
                        roommate_id: roommateId
                    }
                });
                const createdSocial = await SelectedSocial.bulkCreate(socialData);
                responseData.selectedSocials = createdSocial
            }


            if (lifestyle_id) {
                await SelectedLifestyle.destroy({
                    where: { roommate_id: roommateId }
                });

                const lifestyleData = JSON.parse(lifestyle_id).map((item) => {
                    return {
                        lifestyle_id: item,
                        roommate_id: roommateId
                    }
                });
                const createdLifstyle = await SelectedLifestyle.bulkCreate(lifestyleData);
                responseData.selectedLifestyle = createdLifstyle
            }


            //.................upload media ..............
            if (typeof req.files !== 'undefined' && req.files.length > 0) {
                photos = await uploadRoommateFiles(req.files, 'images/roommate_media');
            }
            let mediaUrl = [];
            for (const image of photos) {
                const media = await Roommate_media.create({

                    roommate_id: updateRoommate.id,
                    media: image.roommate_media,
                    media_type: image.media_type,
                })
                mediaUrl.push(media)
                responseData.roommate_media = mediaUrl
            }
        }

        return RESPONSE.success(res, 2205);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}


//delete roommate
const deleteRoommate = async (req, res) => {
    try {
        const authUser = req.user.id;
        const id = req.params.id;
        const roommate = await Roommate.findOne({ where: { id: id, user_id: authUser } });
        if (!roommate) {
            return RESPONSE.error(res, 'room not found');
        }

        const media = await roommate.destroy({ where: { id: id } });

        return RESPONSE.success(res, 1110);
    } catch (error) {
        console.error(error);
        return RESPONSE.error(res, error.message);
    }
}


//delete roommate media by id
const deleteRoommateMedia = async (req, res) => {
    try {
        const ids = req.body.id;
        const authUser = req.user.id;
        const deletedMedia = [];

        const roommateIds = await Roommate_media.findAll({
            where: { id: ids },
            attributes: ['roommate_id'],
        });

        for (const item of roommateIds) {
            const roommate_id = item.roommate_id;

            const associatedItem = await Roommate.findOne({
                where: { id: roommate_id, user_id: authUser },
            });

            if (associatedItem) {
                await Roommate_media.destroy({ where: { id: ids } });
                deletedMedia.push(item.id);
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


//...............................get all roommate...............
const getAllRoommate = async (req, res) => {
    let validation = new Validator(req.query, {
        city: 'string',
        minimum_stay: 'numeric',
        min_budget: 'numeric|min:0',
        max_budget: 'numeric|min:0',
        bedrooms: 'numeric',
        bathrooms: 'numeric',
        gender: 'in:Male,Female,Both',
        food_choice: 'in:Vegetarian,Non-Vegetarian',
        lifestyle: 'array',
        'lifestyle.*': 'string'
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { city, preference_age, age, minimum_stay, min_budget, max_budget, bedrooms, bathrooms, no_of_roommates, gender, food_choice, lifestyle } = req.query;
        const { user: { id } } = req;
        let condition = {}
        let lifeStyleCondition = {}

        if (city) {
            condition.city = city;
        }
        // if (age) {
        //     const [min_age, max_age] = age.split('-')
        //     condition.age = { [Op.gte]: min_age, [Op.lte]: max_age };
        // }
        if (preference_age) {
            condition.preference_age = preference_age;
        }
        if (minimum_stay) {
            condition.minimum_stay = minimum_stay;
        }

        if (bedrooms) {
            condition.bedrooms = bedrooms;
        }

        if (bathrooms) {
            condition.bathrooms = bathrooms;
        }

        if (no_of_roommates) {
            condition.no_of_roommates = no_of_roommates;
        }

        if (min_budget && max_budget) {
            condition.monthly_rent = { [Op.gte]: min_budget, [Op.lte]: max_budget }
        }

        if (gender) {
            if (gender == "Both") {
                condition.gender = { [Op.in]: ['Male', 'Female'] }
            } else {
                condition.gender = gender
            }
        }

        if (food_choice) {
            condition.food_choice = food_choice
        }

        if (lifestyle) {
            lifeStyleCondition.lifestyle_id = { [Op.in]: lifestyle };
        }
        else {
            lifeStyleCondition
        }

        condition.user_id = { [Op.not]: id };
        const findData = await Roommate.findAll({
            where: condition,
            include: [
                {
                    model: Roommate_media,
                    attributes: ['media', 'id']
                },
                {
                    model: SelectedLifestyle,
                    attributes: ['lifestyle_id', 'id'],
                    // where: { lifestyle_id: { [Op.in]: [1] } },
                    where: lifeStyleCondition,
                    required: true,
                    include: [
                        {
                            model: Lifestyle,
                            attributes: ['name', 'id']
                        }
                    ],
                },
                {
                    model: Users,
                    attributes: ['name', 'picture']
                },
            ],
            order: [['createdAt', 'DESC']]
        });
        for (const roommate of findData) {
            const isSaved = await SavedPost.findOne({
                where: { user_id: id, roommateId: roommate.id }
            });
            roommate.dataValues.isSaved = isSaved !== null;
        }


        if (!findData.length) {
            return RESPONSE.error(res, 2204);
        }

        return RESPONSE.success(res, 2203, findData);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}



//.................get roommate by id........................
const getRoommateById = async (req, res) => {
    let validation = new Validator(req.query, {
        ids: 'required'
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { ids } = req.query;
        const { user: { id } } = req

        const findDatas = await Roommate.findOne({
            where: { id: ids },
            include: [
                {
                    model: Roommate_media,
                    attributes: ['media', 'id', 'media_type']
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
                            attributes: ['name', 'icon_url', 'id']
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
                {
                    model: Users,
                    attributes: ['name', 'address', 'picture']
                }
            ],
        });


        if (!findDatas) {
            return RESPONSE.error(res, 2204);
        }

        // const isSaved = await SavedPost.findOne({
        //     where: { user_id: id, roommateId: findDatas.id }
        // });
        // findDatas.dataValues.isSaved = isSaved !== null;
        const isSaved = await SavedPost.findOne({
            where: { user_id: id, roommateId: ids }
        });

        if (isSaved) {
            findDatas.dataValues.isSaved = true;
        } else {
            findDatas.dataValues.isSaved = false;
        }


        return RESPONSE.success(res, 2203, findDatas);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}

//.....................get roommates............

const getRoommate = async (req, res) => {
    try {
        const { user: { id } } = req;

        const findData = await Roommate.findAll({
            where: { user_id: id },
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
                {
                    model: Users,
                    attributes: ['name', 'picture']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        if (!findData) {
            return RESPONSE.error(res, 2204);
        }

        return RESPONSE.success(res, 2203, findData);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}


//.....................booking roommates............
const bookingRoommate = async (req, res) => {
    let validation = new Validator(req.body, {
        roommate_id: 'required',
        date: 'required|date',
        minimum_stay: 'required|numeric|min:1',
        age: 'required|numeric'
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }

    let trans = await db.sequelize.transaction();

    try {
        const { roommate_id, date, minimum_stay, age } = req.body;

        const authUser = req.user;

        const isExist = await Roommate_booking.findAll({
            where: {
                user_id: authUser.id,
                roommate_id: roommate_id,
                status: {
                    [Op.or]: ['Pending', 'Accept']
                }
            }
        });


        if (isExist.length) {
            return RESPONSE.error(res, 2303)
        }

        const findRoommateData = await Roommate.findOne({
            where: { id: roommate_id }, include: {
                model: Users,
                as: 'user',
            }
        });

        if (!findRoommateData) {
            await trans.rollback();
            return RESPONSE.error(res, 2204);
        }

        if (Number(minimum_stay) > Number(findRoommateData.minimum_stay)) {
            await trans.rollback();
            return RESPONSE.error(res, 2302);
        }

        const bookingData = await Roommate_booking.create({ date, minimum_stay, age, user_id: authUser.id, roommate_id: findRoommateData.id }, { transaction: trans })
        if (bookingData) {
            const notificationData = {
                title: "Roommate Booking Notification",
                body: `${findRoommateData.user.name} has requesting to book your roommate.`
            };
            await sendNotification(findRoommateData, notificationData);
        }
        await trans.commit();
        return RESPONSE.success(res, 2301, bookingData);
    } catch (error) {

        await trans.rollback();
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}





module.exports = {
    addRoommate,
    getAllRoommate,
    getRoommateById,
    bookingRoommate,
    getRoommate,
    updateRoommate,
    deleteRoommateMedia,
    deleteRoommate,
    getAllInterest,
    getAllSocialmedia,
    getAllLifestyle
}