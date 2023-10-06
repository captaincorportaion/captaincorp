const db = require("../config/db.config");
const roomType = db.type;

const getAllType = async (req, res) => {
    try {
        const roomTypes = await roomType.findAll();

        return RESPONSE.success(res, 1102, roomTypes);
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}

module.exports = {
    getAllType
}

