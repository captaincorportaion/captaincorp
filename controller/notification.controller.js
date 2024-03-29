const Validator = require("validatorjs");
const db = require('../config/db.config');
const { authUser } = require("../middleware/checkAuth");
const { sendNotification } = require("../helpers/firebase")



//...................models............
const Rent_item_booking = db.rent_item_booking;
const Sale_item_booking = db.sale_item_booking;
const Event_booking = db.event_booking;
const Room_booking = db.room_booking
const Roommate_booking = db.roommate_booking;
const Items = db.items;
const User = db.users
const Rooms = db.rooms
const Roommate = db.roommate
const Event = db.event;


const notification = async (req, res) => {
    try {
        const authUser = req.user;

        const page = Number(req.query.page) || 1;
        const totallimit = Number(req.query.limit);

        const limit = Math.ceil(totallimit / 3);
        if (!limit) {
            return RESPONSE.error(res, "Please provide a valid limit.");
        }

        const offset = (page - 1) * limit;
        // console.log('offset', offset)
        // console.log('limit', limit)

        const rentItemNotifications = await Rent_item_booking.findAndCountAll({
            where: { status: "Pending" },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'picture']
                },
                {
                    model: Items,
                    attributes: ['id', 'user_id', 'title', 'description'],
                    where: { user_id: authUser.id },
                },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        const saleItemNotifications = await Sale_item_booking.findAndCountAll({
            where: { status: "Pending" },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'picture']
                },
                {
                    model: Items,
                    attributes: ['id', 'user_id', 'title', 'description'],
                    where: { user_id: authUser.id },
                },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        const roomNotifications = await Room_booking.findAndCountAll({
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
            limit,
            offset,
        });

        const eventNotifications = await Event_booking.findAndCountAll({
            where: { status: 'Pending' },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'picture']
                },
                {
                    model: Event,
                    attributes: ['id', 'user_id', 'title', 'event_details'],
                    where: { user_id: authUser.id }
                },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        const roommateNotifications = await Roommate_booking.findAndCountAll({
            where: { status: 'Pending' },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'picture']
                },
                {
                    model: Roommate,
                    attributes: ['id', 'user_id', 'message'],
                    where: { user_id: authUser.id }
                },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        const data = [
            ...rentItemNotifications.rows.map(notification => ({
                type: 'Item',
                ...notification.toJSON()
            })),
            ...saleItemNotifications.rows.map(notification => ({
                type: 'Item',
                ...notification.toJSON()
            })),
            ...roomNotifications.rows.map(notification => ({
                type: 'Room',
                ...notification.toJSON()
            })),
            ...roommateNotifications.rows.map(notification => ({
                type: 'Roommate',
                ...notification.toJSON()
            })),
            ...eventNotifications.rows.map(notification => ({
                type: 'Event',
                ...notification.toJSON()
            })),
        ];

        const totalCount = rentItemNotifications.count + saleItemNotifications.count + roomNotifications.count + roommateNotifications.count + eventNotifications.count;
        const lastpage = Math.ceil(totalCount / limit);

        let responseData = {
            data: data,
            page_information: {
                totalrecords: totalCount,
                lastpage: lastpage, // Change lastpage calculation here
                currentpage: page,
                previouspage: page > 1 ? page - 1 : 0,
                nextpage: page < lastpage ? page + 1 : 0, // Change nextpage calculation here
            },
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
        type: 'required|in:Room,Roommate,rentItem'
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
                where: { id, status: "Pending" }, include: {
                    model: User,
                    as: 'user',
                }
            });
            if (!findData) {
                return RESPONSE.error(res, 1012);
            }

            await Room_booking.update({ status: status }, { where: { id: findData.id } });

            if (status === 'Accept') {

                const notificationData = {
                    title: "Room Booking Notification",
                    body: `Your room booking has been accepted.`
                };
                await sendNotification(findData, notificationData);

            } else {

                const notificationData = {
                    title: "Room Booking Notification",
                    body: `Your room booking has been rejected.`
                };
                await sendNotification(findData, notificationData);
            }

        } else if (type == "Roommate") {
            const findData = await Roommate_booking.findOne({
                where: { id, status: "Pending" }, include: {
                    model: User,
                    as: 'user',
                }
            });
            if (!findData) {
                return RESPONSE.error(res, 1012);
            }

            await Roommate_booking.update({ status: status }, { where: { id: findData.id } });
            if (status === 'Accept') {
                const notificationData = {
                    title: "Roommate Booking Notification",
                    body: `Your roommate booking has been accepted.`
                };
                await sendNotification(findData, notificationData);
                // await Roommate_booking.update({ status: 'confirm' }, { where: { id: findData.id } });
            } else {
                const notificationData = {
                    title: "Roommate Booking Notification",
                    body: `Your roommate booking has been rejected.`
                };
                await sendNotification(findData, notificationData);
            }
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

            if (status === 'Accept') {
                const notificationData = {
                    title: "Rent Item Booking Notification",
                    body: `Your rent item booking has been accepted.`
                };
                await sendNotification(findData, notificationData);
            } else {
                const notificationData = {
                    title: "Rent Item Booking Notification",
                    body: `Your rent item booking has been rejected.`
                };
                await sendNotification(findData, notificationData);
            }
        } else {

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

            if (status === 'Accept') {
                const notificationData = {
                    title: "Sale Item Booking Notification",
                    body: `Your Sale item booking has been accepted.`
                };
                await sendNotification(findData, notificationData);
            } else {
                const notificationData = {
                    title: "Sale Item Booking Notification",
                    body: `Your Sale item booking has been rejected.`
                };
                await sendNotification(findData, notificationData);
            }
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