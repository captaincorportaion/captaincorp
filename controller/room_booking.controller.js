const Validator = require('validatorjs');
const db = require("../config/db.config");
const { Op } = require('sequelize')


//...................models............
const Room = db.rooms;
const Room_booking = db.room_booking

//..................... booking roommate ...................

const bookingRoom = async (req, res) => {
    let validation = new Validator(req.body, {
        room_id: 'required',
        date: 'required|date',
        minimum_stay: 'required|numeric|min:1',
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }

    let trans = await db.sequelize.transaction();

    try {
        const { room_id, date, minimum_stay, } = req.body;
        const authUser = req.user;

        const isExist = await Room_booking.findAll({
            where: {
                user_id: authUser.id,
                room_id: room_id,
                status: {
                    [Op.or]: ['Pending', 'Accept']
                }
            }
        });

        if (isExist.length) {
            return RESPONSE.error(res, 1111)
        }
        const findData = await Room.findOne({ where: { id: room_id } });

        if (!findData) {
            await trans.rollback();
            return RESPONSE.error(res, 1105);
        }

        if (Number(minimum_stay) > Number(findData.minimumStay)) {
            await trans.rollback();
            return RESPONSE.error(res, 2302);
        }

        const bookingRoom = await Room_booking.create({ date, minimum_stay, user_id: authUser.id, room_id: findData.id }, { transaction: trans })

        await trans.commit();
        return RESPONSE.success(res, 1106, bookingRoom);
    } catch (error) {

        await trans.rollback();
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}


module.exports = {
    bookingRoom
}