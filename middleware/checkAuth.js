const db = require("../config/db.config");
const UserSession = db.user_sessions;
const Users = db.users;
const moment = require('moment');


// user authentication
const authUser = async (req, res, next) => {
    const headerToken = req.headers.authorization ? req.headers.authorization : null;
    // console.log("token", headerToken);
    // console.log('headerToken', headerToken)
    if (!headerToken || !headerToken.startsWith("Bearer")) {
        return RESPONSE.error(res, 1009);
    }

    const token = headerToken.split(" ")[1];
    // console.log('token', token)
    const isAuth = await UserSession.findOne({
        where: {
            token: token
        }
    });

    if (isAuth != null) {
        if (isAuth.expire_timestamp + 360000 < moment().unix()) {
            await UserSession.destroy({
                where: {
                    token: token
                }
            });
            return res.status(401).json({
                success: false,
                message: 'Session expired.',
            });
        } else {
            await UserSession.update({
                expire_timestamp: moment().unix()
            }, {
                where: {
                    token: token
                }
            });
            let users = await Users.findOne({
                where: {
                    id: isAuth.user_id,
                    // is_customer: 0,
                    // active: 1,
                }
            });
            if (users == null) {
                return res.status(401).json({
                    success: false,
                    message: 'Please login as a user',
                });
            }
            req.user = users
            next();
        }

    } else {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized Users',
        });
    }
}


module.exports = {
    authUser
};