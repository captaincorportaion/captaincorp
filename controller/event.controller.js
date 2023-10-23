const Validator = require("validatorjs");
const db = require('../config/db.config');
const { UploadFiles } = require('../helpers/file')
const { Op, sequelize } = require('sequelize')


//...................models............
const Event_categories = db.event_categories;
const Event_amenities = db.event_amenities;
const Event = db.event;
const Event_photos = db.event_photos;
const Event_booking = db.event_booking;
const Selected_amenities = db.selected_amenities;
const Users = db.users;


//.......................get All event_categories.....
const getAllEventCategories = async (req, res) => {
    try {
        const authUser = req.user;

        const eventCategories = await Event_categories.findAll();

        if (!eventCategories) {
            return RESPONSE.error(res, 2002);
        }

        return RESPONSE.success(res, 2001, eventCategories);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}


//.......................get All event_categories.....
const getAllEventAmenities = async (req, res) => {
    try {
        const authUser = req.user;

        const eventAmenities = await Event_amenities.findAll();

        if (!eventAmenities) {
            return RESPONSE.error(res, 2004);
        }

        return RESPONSE.success(res, 2003, eventAmenities);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}


//.....................create event......................
const createEvent = async (req, res) => {
    let validation = new Validator(req.body, {
        event_title: 'required|string',
        event_details: 'required|string',
        seats: 'required|numeric',
        date: 'required',
        time: 'required',
        price: 'required',
        city: 'required|string',
        lat: 'required',
        long: 'required',
        event_amenities_id: 'required|array',
        category_id: 'required'
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const authUser = req.user.id;

        const { event_title, event_details, seats, date, time, price, city, lat, long, category_id, event_amenities_id } = req.body;

        const event = await Event.create({ user_id: authUser, event_title, event_details, seats, date, time, price, city, lat, long, category_id });

        if (event) {

            for (selectedData of event_amenities_id) {

                await Selected_amenities.create({
                    event_amenities_id: selectedData,
                    event_id: event.id
                });
            }

            let photos = [];
            if (typeof req.files !== 'undefined' && req.files.length > 0) {
                photos = await UploadFiles(req.files, 'images/event_images', 'image');
            }
            for (const image of photos) {
                await Event_photos.create({
                    event_id: event.id,
                    photo: image
                })
            }

        }

        const findEvent = await Event.findOne({
            where: { id: event.id },
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
        });


        return RESPONSE.success(res, 2005);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}


//.....................update event......................
const updateEvent = async (req, res) => {
    try {
        const authUser = req.user.id;
        const eventId = req.params.id;

        const findEvent = await Event.findOne({ where: { id: eventId, user_id: authUser } });
        if (!findEvent) {
            return RESPONSE.error(res, 'event not found');
        }


        const { event_title, event_details, seats, date, time, price, city, lat, long, category_id, event_amenities_id } = req.body;


        if (event_amenities_id && event_amenities_id.length < 0) {
            return RESPONSE.error(res, 1103)
        }

        const event = await findEvent.update({ event_title, event_details, seats, date, time, price, city, lat, long, category_id });

        let responseData = null
        responseData = event.toJSON();

        if (event_amenities_id) {
            await Selected_amenities.destroy({
                where: { event_id: eventId }
            });

            const amenitieData = JSON.parse(event_amenities_id).map((item) => {
                return {
                    event_amenities_id: item,
                    event_id: eventId
                }
            });
            const createdAmenities = await Selected_amenities.bulkCreate(amenitieData);
            responseData.selected_amenities = createdAmenities
        }


        if (typeof req.files !== 'undefined' && req.files.length > 0) {
            photos = await UploadFiles(req.files, 'images/event_images', 'image');
        }
        let event_photos = []
        for (const image of event_photos) {
            const eventPhoto = await Event_photos.create({
                event_id: event.id,
                photo: image
            })
            event_photos.push(eventPhoto)

            responseData.event_photos = event_photos

        }
        return RESPONSE.success(res, 2009);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}

//delet event
const deleteEvent = async (req, res) => {
    try {
        const authUser = req.user.id;
        const id = req.params.id;
        const event = await Event.findOne({ where: { id: id, user_id: authUser } });
        if (!event) {
            return RESPONSE.error(res, 'event not found');
        }

        const media = await event.destroy({ where: { id: id } });

        return RESPONSE.success(res, 1110);
    } catch (error) {
        console.error(error);
        return RESPONSE.error(res, error.message);
    }
}


//delete media by id
const deleteEventPhotos = async (req, res) => {
    try {
        const ids = req.body.id;
        // console.log('ids', ids)
        const authUser = req.user.id;
        const deletedMedia = [];

        const eventIds = await Event_photos.findAll({
            where: { id: ids },
            attributes: ['event_id'],
        });
        // console.log('eventIds', eventIds)

        for (const event of eventIds) {
            const event_id = event.event_id;

            // Use Items.findOne to check if the associated item exists
            const associatedItem = await Event.findOne({
                where: { id: event_id, user_id: authUser },
            });
            // console.log('associatedItem', associatedItem)

            if (associatedItem) {
                // Use await with Items_photos.destroy
                await Event_photos.destroy({ where: { id: ids } });
                deletedMedia.push(event.id);
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



//....................event booking ...........................
const eventBooking = async (req, res) => {
    let validation = new Validator(req.body, {
        event_id: 'required',
        participants: 'required|numeric|min:1',
    });
    // console.log('req.body', req.body)
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    let trans = await db.sequelize.transaction();
    try {
        const { event_id, participants } = req.body;
        const authUser = req.user;

        const isExist = await Event_booking.findAll({
            where: {
                user_id: authUser.id,
                event_id: event_id,
                status: {
                    [Op.or]: ['Pending', 'Accept']
                }
            }
        });

        if (isExist.length) {
            await trans.rollback();
            return RESPONSE.error(res, 2107)
        }

        const findEvent = await Event.findOne({ where: { id: event_id } });

        if (!findEvent) {
            await trans.rollback();
            return RESPONSE.error(res, 1105);
        }

        if (Number(participants) > Number(findEvent.seats)) {
            await trans.rollback();
            return RESPONSE.error(res, 2007);
        }

        const eventBooking = await Event_booking.create({ user_id: authUser.id, event_id: findEvent.id, participants }, { transaction: trans });

        await trans.commit();
        return RESPONSE.success(res, 2006, eventBooking);
    } catch (error) {
        await trans.rollback();
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}

//get your all events

const getEvent = async (req, res) => {
    try {
        const { user: { id } } = req;
        const event = await Event.findAll({
            where: { user_id: id },
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
        });
        return RESPONSE.success(res, 2008, event);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
};

//...........get all event............
const getAllEvents = async (req, res) => {
    try {
        const authUser = req.user;
        const findEvent = await Event.findAll({
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
            order: [['createdAt', 'DESC']]
        });
        // if (!findEvent.length) {
        //     return RESPONSE.error(res, 2010);
        // }
        return RESPONSE.success(res, 2008, findEvent);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}

//...........get all event by id............
const getAllEventsById = async (req, res) => {
    let validation = new Validator(req.query, {
        id: 'required',
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { id } = req.query;
        const findEvent = await Event.findByPk(id, {
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
                            attributes: ['name', 'id', 'icon_url']
                        }
                    ]
                },
                {
                    model: Users,
                    attributes: ['name', 'picture']
                }
            ],
        });

        return RESPONSE.success(res, 2008, findEvent);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}

//.................get all event with filter.....................
const getEventWithFilter = async (req, res) => {
    let validation = new Validator(req.query, {
        category_id: 'required',
        date: 'date'
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { category_id, date, city } = req.query;
        let condition = {}
        if (category_id) {
            condition.category_id = category_id
        }
        if (city) {
            condition.city = city
        }
        if (date) {
            condition.date = date
        }
        const findEvent = await Event.findAll({
            where: condition,
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
            order: [['createdAt', 'DESC']]
        })
        if (!findEvent.length) {
            return RESPONSE.error(res, 2010);
        }
        return RESPONSE.success(res, 2008, findEvent);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}


module.exports = {
    getAllEventCategories,
    getAllEventAmenities,
    createEvent,
    eventBooking,
    eventBooking,
    getEvent,
    updateEvent,
    deleteEventPhotos,
    deleteEvent,
    getAllEvents,
    getEventWithFilter,
    getAllEventsById
}

