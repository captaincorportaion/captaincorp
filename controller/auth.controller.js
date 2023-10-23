
const db = require("../config/db.config");
const Validator = require('validatorjs');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer')
const { Sequelize, Op } = require('sequelize');
const Users = db.users;
// const config = db.configs;
const config = require('../config/config')

const UserSession = db.user_sessions;
// const jwt = require('jsonwebtoken');

// const signUp = async (req, res) => {
//     try {
//         let validation = new Validator(req.body, {
//             name: 'required',
//             email: 'required',
//             password: 'required',
//         });

//         if (validation.fails()) {
//             firstMessage = Object.keys(validation.errors.all())[0];
//             return RESPONSE.error(res, validation.errors.first(firstMessage), '', 400);
//         }
//         const { name, email, password } = req.body;

//         const existingUser = await Users.findOne({ where: { email: email } });

//         if (existingUser) {
//             return RESPONSE.error(res, 1003);
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const newUser = await Users.create({
//             name,
//             email,
//             password: hashedPassword,
//         });
//         let userToken;
//         if (newUser) {
//             newUser = newUser.toJSON();
//             userToken = await UserSession.createToken(newUser.id);
//         }

//         const addUser = {
//             newUser: {
//                 ...newUser,
//                 token: userToken,
//             },
//         }

//         return RESPONSE.success(res, 1001, addUser);
//     } catch (error) {
//         console.log(error)
//         return RESPONSE.error(res, error.message);
//     }
// }
const signUp = async (req, res) => {
    try {
        let validation = new Validator(req.body, {
            name: 'required',
            email: 'required',
            password: 'required',
        });

        if (validation.fails()) {
            firstMessage = Object.keys(validation.errors.all())[0];
            return RESPONSE.error(res, validation.errors.first(firstMessage), '', 400);
        }
        const { name, email, password } = req.body;

        const existingUser = await Users.findOne({ where: { email: email } });

        if (existingUser) {
            return RESPONSE.error(res, 1003);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await Users.create({
            name,
            email,
            password: hashedPassword,
        });

        if (user) {
            const newUser = user.toJSON();
            const userToken = await UserSession.createToken(newUser.id);
            newUser.token = userToken;

            const addUser = {
                newUser,
            }

            return RESPONSE.success(res, 1001, addUser);
        }
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, error.message);
    }
}

const login = async (req, res) => {
    try {
        let validation = new Validator(req.body, {
            emailOrPhoneNumber: 'required',
            password: 'required'
        });

        if (validation.fails()) {
            firstMessage = Object.keys(validation.errors.all())[0];
            return RESPONSE.error(res, validation.errors.first(firstMessage), '', 400);
        }
        const { emailOrPhoneNumber, password } = req.body;

        let userIsExist = await Users.findOne({
            where: {
                [Op.or]: [
                    { email: emailOrPhoneNumber },
                    { phoneNumber: emailOrPhoneNumber }
                ]
            }
        });

        if (!userIsExist) {
            return RESPONSE.error(res, 1004);
        }

        if (userIsExist != null && bcrypt.compareSync(password, userIsExist.password)) {
            userIsExist = userIsExist.toJSON();
            userIsExist.token = await UserSession.createToken(userIsExist.id);
            return RESPONSE.success(res, 1002, userIsExist);
        } else {
            return RESPONSE.error(res, 1005)
        }
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
}

// const forgotPassword = async (req, res) => {
//     try {
//         let validation = new Validator(req.body, {
//             email: 'required',
//         });

//         if (validation.fails()) {
//             firstMessage = Object.keys(validation.errors.all())[0];
//             return RESPONSE.error(res, validation.errors.first(firstMessage), '', 400);
//         }
//         const { email } = req.body;

//         const existingUser = await Users.findOne({ where: { email: email } });

//         if (existingUser) {
//             return RESPONSE.error(res, 1003);
//         }
//         const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString()
//         let genOtp = generateOtp() // generate otp
//         const otp = await bcrypt.hash(genOtp, 10)


//     } catch (error) {
//         console.log(error)
//         return RESPONSE.error(res, error.message);
//     }
// }

const forgotPassword = async (req, res, next) => {
    let validation = new Validator(req.body, {
        email: 'required',
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { email } = req.body;
        const user = await Users.findOne({ where: { email } });

        if (!user) {
            return RESPONSE.error(res, 1004)
        }

        // Generate reset token and set its expiration time
        const generateOtp = Math.floor(1000 + Math.random() * 9000).toString();
        const resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour

        // Save the reset token and its expiration time to the user document
        await user.update({
            generateOtp,
            resetTokenExpiry,
        });

        // Send the reset password email
        const resetPasswordUrl = `resetPassword/${generateOtp}`;
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: config.email.fromEmail,
            to: email,
            subject: 'Reset Your Password',
            html: `Click the following link to reset your password: <a href="${resetPasswordUrl}">${resetPasswordUrl}</a>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return RESPONSE.error(res, error.message);
            }

            return RESPONSE.success(res, 1006);
        });
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { generateOtp, newPassword } = req.body;
        const user = await Users.findOne({
            where: {
                generateOtp,
                resetTokenExpiry: { [Op.gt]: new Date() },
            },
        });

        if (!user) {
            return RESPONSE.error(res, 1007)
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update the user's password
        await user.update({
            password: hashedPassword,
            generateOtp: null,
            resetTokenExpiry: null,
        });

        // Send password reset confirmation email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: config.email.fromEmail,
            to: user.email,
            subject: 'Password Reset Confirmation',
            text: 'Your password has been successfully reset.',
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return RESPONSE.error(res, error.message);
            }

            return RESPONSE.success(res, 1008);
        });
    } catch (error) {
        console.log(error)
        return RESPONSE.error(res, error.message);
    }
};

const updateProfile = async (req, res) => {
    try {
        const { user: { id }, body } = req;
        // console.log(req.files);
        const user = await Users.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (typeof req.files !== 'undefined' && req.files.length > 0) {
            const profileImage = await FILEACTION.uploadProfileImage(req.files, 'profile_image');
            // console.log(profileImage)
            req.body.picture = `/profile_image/${profileImage}`
        }
        await Users.update(body, {
            where: { id: id },
        });
        const updatedUser = await Users.findByPk(id);
        return RESPONSE.success(res, 1015, updatedUser);
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, error.message);
    }
}

const getProfile = async (req, res) => {
    try {
        const { user: { id } } = req
        const oneUser = await Users.findOne({
            where: { id: id }, attributes: {
                exclude: ['password', 'device', 'course', 'classYear', 'active', 'deletedAt', 'updatedAt', 'createdAt', 'generateOtp', 'resetTokenExpiry']
            }
        })


        return RESPONSE.success(res, 1016, oneUser);
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, error.message);
    }
}


module.exports = { signUp, login, forgotPassword, resetPassword, updateProfile, getProfile };


