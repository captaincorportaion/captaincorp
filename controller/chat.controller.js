const db = require('../config/db.config');
const { Op, Sequelize } = require('sequelize');
const Validator = require('validatorjs');


//.....................models...............
const UserSession = db.user_sessions;
const Conversations = db.conversations;
const Conversations_chats = db.conversations_chat;


let users = [];

//.................function
const addUser = (userId, socketId) => {
    !users.some((user) => user.socketId == socketId) && users.push({ userId, socketId });
}

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
    return users
}

const getUser = (value, key = "userId") => {
    const data = users.filter(user => user[key] == value);
    return data
}


//...............middleware
async function socketAuth(socket, next) {
    try {
        const token = socket.handshake.headers && socket.handshake.headers.authorization ? socket.handshake.headers.authorization : null;
        const isAuth = await UserSession.findOne({ where: { token: token }, attributes: ['user_id'] });

        if (isAuth) {
            addUser(isAuth.user_id, socket.id);
            socket.authUser = {
                userId: isAuth.user_id
            }
            next();
        }
        else {
            throw new Error("Unauthorized user")
        }
    } catch (error) {
        console.log(error)
    }
}


//.............create message 
const createMessage = async (data) => {
    try {
        const authUser = data.authUser;

        let conversations = await Conversations.findOne({
            where: {
                [Op.and]: [
                    { [Op.or]: [{ sender_id: authUser.userId }, { receiver_id: authUser.userId }] },
                    { [Op.or]: [{ sender_id: data.receiver_id }, { receiver_id: data.receiver_id }] }
                ]
            }
        });
        if (!conversations) {
            conversations = await Conversations.create({
                sender_id: authUser.userId,
                receiver_id: data.receiver_id
            })
        }

        const message = await Conversations_chats.create({
            conversations_id: conversations.id,
            sender_id: authUser.userId,
            message: data.message
        })

        return message
    } catch (error) {
        console.log(error);
    }
}

//................Get conversations
const getConversations = async (data) => {
    try {

        const authUser = data.authUser;

        let conditionOffset = {};
        // Pagination
        const page = Number(data.page) || 1;
        const limit = Number(data.limit) || 15;
        const offset = (page - 1) * limit;

        if (limit && page) {
            conditionOffset.limit = limit;
            conditionOffset.offset = offset;
        }

        const conversations = await Conversations.findAndCountAll({
            where: {
                [Op.or]: [
                    { receiver_id: authUser.userId },
                    { sender_id: authUser.userId }
                ]
            },
            include: [
                {
                    model: Conversations_chats,
                    order: [['created_at', 'DESC']],
                    limit: 1,
                    as: 'chat',
                },
            ],
            order: [
                [Sequelize.literal('(SELECT MAX(`created_at`) FROM `Conversations_chats` WHERE `conversations_id` = `Conversations`.`id`)'), 'DESC'],
            ],
            ...conditionOffset
        });

        conversations.page_Information = {
            totalrecords: conversations.count,
            lastpage: Math.ceil(conversations.count / limit),
            currentpage: page,
            previouspage: 0 + (page - 1)
        }
        return conversations
    } catch (error) {
        console.log(error);
    }
}



//.....................get chat By Id  API .....................

const getChatById = async (req, res) => {
    let validation = new Validator(req.query, {
        receiver_id: 'required',
    });
    if (validation.fails()) {
        firstMessage = Object.keys(validation.errors.all())[0];
        return RESPONSE.error(res, validation.errors.first(firstMessage))
    }
    try {
        const { receiver_id } = req.query;
        const authUser = req.user.id;

        const page = req.query.page ? parseInt(req.query.page) : 1
        const limit = req.query.limit ? parseInt(req.query.limit) : 15
        const offset = 0 + (page - 1) * limit

        const findConversation = await Conversations.findOne({
            where: {
                [Op.and]: [
                    { sender_id: authUser },
                    { receiver_id: receiver_id }
                ]
            },
        });

        if (!findConversation) {
            return RESPONSE.error(res, 1014);
        }

        const findChat = await Conversations_chats.findAndCountAll({
            where: {
                conversations_id: findConversation.id,
            },
            limit: limit,
            offset: offset,
            order: [['createdAt', 'DESC']],

        })

        let responseData = {
            chatData: findChat.rows,
            page_information: {
                totalrecords: findChat.count,
                lastpage: Math.ceil(findChat.count / (limit * 3)),
                currentpage: page,
                previouspage: 0 + (page - 1),
                nextpage: page < Math.ceil(findChat.count / (limit * 3)) ? page + 1 : 0
            }
        };
        return RESPONSE.success(res, "get Chat Successfully", responseData)
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, error.message);
    }
}


// ................socket events 
async function socketEvent(io) {

    io.on('connection', socket => {
        console.log(socket.id, 'connected....');

        socket.on('sendMessage', async (data) => {

            data.authUser = socket.authUser;
            const senders = getUser(data.authUser.userId);
            const receivers = getUser(data.receiver_id);
            const message = await createMessage(data);

            senders.map(sender => {
                io.to(sender.socketId).emit('getMessage', message)
            });

            receivers.map(receiver => {
                io.to(receiver.socketId).emit('getMessage', message)
            });

        });

        socket.on('getConversation', async (data) => {
            data.authUser = socket.authUser;
            const conversation = await getConversations(data);
            io.to(socket.id).emit("conversations", conversation);

        })

        socket.on('disconnect', () => {
            console.log(socket.id, "disconnect");
            removeUser(socket.id)

        });

    })
}


module.exports = {
    socketEvent,
    socketAuth,
    getChatById
}