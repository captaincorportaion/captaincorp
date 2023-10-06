const Validator = require("validatorjs");
const db = require('../config/db.config');
const { authUser } = require("../middleware/checkAuth");



//...................models............
const Rent_item_booking = db.rent_item_booking;
const Event_booking = db.event_booking;
const Room_booking = db.room_booking
const Roommate_booking = db.roommate_booking;
const Items = db.items;
const User = db.users
const Rooms = db.rooms
const Roommate = db.roommate





//................get All  notification .....................
const notification = async (req, res) => {
    try {
        // const { request, id, type } = req.query;

        const authUser = req.user;

        let conditionOffset = {};
        // Pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit);
        const offset = (page - 1) * limit;

        if (limit && page) {
            conditionOffset.limit = limit;
            conditionOffset.offset = offset;
        }

        const findItem = await Rent_item_booking.findAndCountAll({
            where: { status: "Pending" },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'picture']
                },
                {
                    model: Items,
                    attributes: ['id', 'user_id', 'title', 'description'],
                    where: { user_id: authUser.id }
                },

            ],
            order: [['createdAt', 'DESC']],
            ...conditionOffset,

        });


        const findRoom = await Room_booking.findAndCountAll({
            where: { status: 'Pending' },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'picture']
                },
                {
                    model: Rooms,
                    attributes: ['id', 'user_id', 'title', 'description'],
                    where: { user_id: authUser.id }
                },

            ],
            order: [['createdAt', 'DESC']],
            ...conditionOffset
        });


        const findRoommate = await Roommate_booking.findAndCountAll({
            where: { status: 'Pending' },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'picture']
                },
                {
                    model: Roommate,
                    attributes: ['id', 'user_id'],
                    where: { user_id: authUser.id }
                },

            ],
            order: [['createdAt', 'DESC']],
            ...conditionOffset
        })

        const data = [...findItem.rows, ...findRoom.rows, ...findRoommate.rows];
        const totalCount = findItem.count + findRoom.count + findRoommate.count;


        let responseData = {
            data: data,
            page_information: {
                totalrecords: totalCount,
                lastpage: Math.ceil(totalCount / (limit * 3)),
                currentpage: page,
                previouspage: 0 + (page - 1),
                nextpage: page < Math.ceil(totalCount / (limit * 3)) ? page + 1 : 0
            }
        };
        return RESPONSE.success(res, 1010, responseData);

    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, error.message);
    }
}



//...........................update notification........................
const updateNotification = async (req, res) => {
    let validation = new Validator(req.query, {
        status: 'required|in:Decline,Accept',
        id: 'required',
        type: 'required|in:Room,Roommate,Item'
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { status, id, type } = req.query;

        const authUser = req.user;

        if (type == "Room") {
            const findData = await Room_booking.findOne({ where: { id: id, status: "Pending" } });

            if (!findData) {
                return RESPONSE.error(res, 1012);
            }

            await Room_booking.update({ status: status }, { where: { id: findData.id } });

        } else if (type == "Roommate") {
            const findData = await Roommate_booking.findOne({ where: { id: id, status: "Pending" } });

            if (!findData) {
                return RESPONSE.error(res, 1012);
            }

            await Roommate_booking.update({ status: status }, { where: { id: findData.id } });

        } else {

            const findData = await Rent_item_booking.findOne({ where: { id: id, status: "Pending" } });

            if (!findData) {
                return RESPONSE.error(res, 1012);
            }

            await Rent_item_booking.update({ status: status }, { where: { id: findData.id } });
        }

        return RESPONSE.success(res, 1011);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}


module.exports = {
    notification,
    updateNotification
}