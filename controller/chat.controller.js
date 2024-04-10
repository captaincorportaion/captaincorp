const db = require("../config/db.config");
const { Op, Sequelize, where } = require("sequelize");
const Validator = require("validatorjs");

//.....................models...............
const Users = db.users;
const UserSession = db.user_sessions;
const Conversations = db.conversations;
const Conversations_chats = db.conversations_chat;
const msg_count_converastions = db.msg_count_converastion;

let users = [];

//.................function
const addUser = (userId, socketId) => {
  !users.some((user) => user.socketId == socketId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
  return users;
};

const getUser = (value, key = "userId") => {
  const data = users.filter((user) => user[key] == value);
  return data;
};

//...............middleware
async function socketAuth(socket, next) {
  try {
    const token =
      socket.handshake.headers && socket.handshake.headers.authorization
        ? socket.handshake.headers.authorization
        : null;
    const isAuth = await UserSession.findOne({
      where: { token: token },
      attributes: ["user_id"],
    });

    if (isAuth) {
      addUser(isAuth.user_id, socket.id);
      socket.authUser = {
        userId: isAuth.user_id,
      };
      next();
    } else {
      throw new Error("Unauthorized user");
    }
  } catch (error) {
    console.log(error);
  }
}

//.............create message
const createMessage = async (data) => {
  try {
    const authUser = data.authUser;

    let conversations = await Conversations.findOne({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { sender_id: authUser.userId },
              { receiver_id: authUser.userId },
            ],
          },
          {
            [Op.or]: [
              { sender_id: data.receiver_id },
              { receiver_id: data.receiver_id },
            ],
          },
        ],
      },
    });
    if (!conversations) {
      conversations = await Conversations.create({
        sender_id: authUser.userId,
        receiver_id: data.receiver_id,
      });
    }

    const message = await Conversations_chats.create({
      conversations_id: conversations.id,
      sender_id: authUser.userId,
      message: data.message,
    });

    // const receiverOnScreen = data.isOnScreen || false; // Assuming isOnScreen is a boolean in data
    // await createOrUpdateMsgCount(authUser.userId, data.receiverId, receiverOnScreen);
    return message;
  } catch (error) {
    console.log(error);
  }
};

//message count conversation
// const createOrUpdateMsgCount = async (req, res) => {
//     try {
//         const authUser = req.user.id;
//         // console.log('authUser', authUser)
//         // Check if entry exists
//         const { body: { receiverId, isOnScreen } } = req
//         let msgCountEntry = await msg_count_converastions.findAll({
//             where: {
//                 user_id: authUser,
//                 receiver_id: receiverId,
//             }
//         });

//         if (!msgCountEntry) {
//             // Create new entry
//             msgCountEntry = await msg_count_converastions.create({
//                 user_id: authUser,
//                 receiver_id: receiverId,
//                 is_onscreen: isOnScreen,
//             });
//             // console.log('msgCountEntry', msgCountEntry)
//         } else {
//             // Update existing entry
//             await msgCountEntry.update({
//                 is_onscreen: isOnScreen,
//             });
//         }

//         return msgCountEntry;
//     } catch (error) {
//         console.log(error);
//     }
// };

const createOrUpdateMsgCount = async (req, res) => {
  try {
    const authUser = req.user.id;
    const {
      body: { receiverId, isOnScreen },
    } = req;

    // Check if entry exists
    let msgCountEntry = await msg_count_converastions.findAll({
      where: {
        user_id: authUser,
        receiver_id: receiverId,
      },
    });

    if (msgCountEntry.length === 0) {
      // Create new entry
      msgCountEntry = await msg_count_converastions.create({
        user_id: authUser,
        receiver_id: receiverId,
        is_onscreen: isOnScreen,
      });
    } else {
      // Update existing entry
      await msgCountEntry[0].update({
        is_onscreen: isOnScreen,
      });
    }

    return RESPONSE.success(res, "Successfully", msgCountEntry);
  } catch (error) {
    console.log(error);
  }
};

//................Get conversations
const getConversations = async (data) => {
  try {
    const authUser = data.authUser;
    // let conditionOffset = {};
    // Pagination
    // const page = Number(data.page) || 1;
    // const limit = Number(data.limit) || 15;
    // const offset = (page - 1) * limit;
    // if (limit && page) {
    //     conditionOffset.limit = limit;
    //     conditionOffset.offset = offset;
    // }
    const conversations = await Conversations.findAndCountAll({
      where: {
        [Op.or]: [
          { receiver_id: authUser.userId },
          { sender_id: authUser.userId },
        ],
      },
      include: [
        {
          model: Conversations_chats,
          order: [["created_at", "DESC"]],
          limit: 1,
          as: "chat",
        },
        {
          model: Users,
          as: "sender",
          attributes: ["id", "name", "picture"],
        },
        {
          model: Users,
          as: "receiver",
          attributes: ["id", "name", "picture"],
        },
      ],
      order: [
        [
          Sequelize.literal(
            "(SELECT MAX(`created_at`) FROM `Conversations_chats` WHERE `conversations_id` = `Conversations`.`id`)"
          ),
          "DESC",
        ],
      ],
      attributes: [
        [
          Sequelize.literal(
            '(SELECT COUNT(*) FROM `Conversations_chats` WHERE `conversations_id` = `conversations`.`id` AND status IN ("Sent", "Deliver"))'
          ),
          "messageCount",
        ],
      ],
      // ...conditionOffset
    });
    // conversations.page_Information = {
    //     totalrecords: conversations.count,
    //     lastpage: Math.ceil(conversations.count / limit),
    //     currentpage: page,
    //     previouspage: 0 + (page - 1)
    // }
    return conversations;
  } catch (error) {
    console.log(error);
  }
};

//.....................get chat By Id  API .....................

const getChatById = async (req, res) => {
  let validation = new Validator(req.query, {
    receiver_id: "required",
  });
  if (validation.fails()) {
    firstMessage = Object.keys(validation.errors.all())[0];
    return RESPONSE.error(res, validation.errors.first(firstMessage));
  }
  try {
    const { receiver_id } = req.query;
    const authUser = req.user.id;

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 15;
    const offset = 0 + (page - 1) * limit;

    const findConversation = await Conversations.findOne({
      where: {
        [Op.or]: [
          {
            [Op.and]: [{ sender_id: authUser }, { receiver_id: receiver_id }],
          },
          {
            [Op.and]: [{ sender_id: receiver_id }, { receiver_id: authUser }],
          },
        ],
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
      order: [["createdAt", "DESC"]],
    });
    const changeStatus = await Conversations_chats.update(
      { status: "Read" },
      {
        where: {
          conversations_id: findConversation.id,
          status: {
            [Op.in]: ["Sent", "Deliver"],
          },
        },
      }
    );

    let responseData = {
      chatData: findChat.rows,
      page_information: {
        totalrecords: findChat.count,
        lastpage: Math.ceil(findChat.count / (limit * 3)),
        currentpage: page,
        previouspage: 0 + (page - 1),
        nextpage: page < Math.ceil(findChat.count / (limit * 3)) ? page + 1 : 0,
      },
    };
    return RESPONSE.success(res, "get Chat Successfully", responseData);
  } catch (error) {
    console.log(error);
    return RESPONSE.error(res, error.message);
  }
};

// ................socket events
async function socketEvent(io) {
  io.on("connection", (socket) => {
    console.log(socket.id, "connected....");

    socket.on("sendMessage", async (data) => {
      data.authUser = socket.authUser;
      const senders = getUser(data.authUser.userId);
      const receivers = getUser(data.receiver_id);
      const message = await createMessage(data);
      senders.map(async (sender) => {
        // const findOnscreen = msg_count_converastions.findAll({
        //     where: {
        //         receiver_id: senders,
        //         user_id: receivers,
        //         is_onscreen: true

        //     }
        // })

        // if (findOnscreen) {
        //     const updateStatus = Conversations_chats.update({
        //         where: {
        //             status: "read"
        //         }
        //     })
        // } else {
        //     const updateStatus = Conversations_chats.update({
        //         where: {
        //             status: "sent"
        //         }
        //     })
        // }

        io.to(sender.socketId).emit("getMessage", message);
      });

      // receivers.map(async (receiver) => {
      //     const findOnscreen = await msg_count_converastions.findAll({
      //         where: {
      //             receiver_id: data.authUser.userId,
      //             user_id: receiver.userId,
      //             is_onscreen: true
      //         }
      //     });
      //     // console.log('findOnscreen', findOnscreen)

      //     const conversation = await Conversations.findOne({
      //         where: {
      //             [Op.or]: [
      //                 { id: data.conversations_id },
      //                 { sender_id: data.authUser.userId, receiver_id: data.receiver_id },
      //                 { sender_id: data.receiver_id, receiver_id: data.authUser.userId }
      //             ]
      //         }
      //     });
      //     console.log('conversations_id:', data.conversations_id);
      //     console.log('authUser.userId:', data.authUser.userId);
      //     console.log('receiver_id:', data.receiver_id);

      //     const conversationId = conversation.id;

      //     if (findOnscreen.length > 0) {
      //         const updateStatus = Conversations_chats.update(
      //             { status: "Read" },
      //             {
      //                 where: {
      //                     // receiver_id: data.authUser.userId,
      //                     user_id: receiver.userId,
      //                 }
      //             }

      //         );
      //         console.log('updateStatusqq', updateStatus)

      //     } else {
      //         const updateStatus = Conversations_chats.update(
      //             { status: "Sent" },
      //             {
      //                 where: {
      //                     // receiver_id: data.authUser.userId,
      //                     user_id: receiver.userId,
      //                 }
      //             }

      //         );
      //         // console.log('updateStatus', updateStatus)
      //     }

      //     io.to(receiver.socketId).emit('getMessage', message)
      // });
      receivers.map(async (receiver) => {
        const findOnscreen = await msg_count_converastions.findAll({
          where: {
            receiver_id: data.authUser.userId,
            user_id: receiver.userId,
            is_onscreen: true,
          },
        });

        // Check if data.conversations_id is defined
        // if (typeof data.conversations_id === 'undefined') {
        //     console.error('data.conversations_id is undefined');
        //     return;
        // }
        const conversation = await Conversations.findOne({
          where: {
            [Op.or]: [
              // { id: data.conversations_id },
              {
                sender_id: data.authUser.userId,
                receiver_id: data.receiver_id,
              },
              {
                sender_id: data.receiver_id,
                receiver_id: data.authUser.userId,
              },
            ],
          },
        });

        const conversationId = conversation.id;

        if (findOnscreen.length > 0) {
          const updateStatus = await Conversations_chats.update(
            { status: "Read" },
            {
              where: {
                sender_id: data.authUser.userId,
                // user_id: receiver.userId,
              },
            }
          );
          console.log("updateStatusqq", updateStatus);
        } else {
          const updateStatus = await Conversations_chats.update(
            { status: "Sent" },
            {
              where: {
                sender_id: data.authUser.userId,
                // user_id: receiver.userId,
              },
            }
          );
          // console.log('updateStatus', updateStatus)
        }

        io.to(receiver.socketId).emit("getMessage", message);
      });

      const authUser = data.authUser;
      const conversationExists = await Conversations.findAll({
        where: {
          [Op.or]: [
            { receiver_id: authUser.userId },
            { sender_id: authUser.userId },
          ],
        },
      });

      if (conversationExists) {
        const conversation = await getConversations(data);
        // console.log('senders', senders)
        senders.forEach((sender) => {
          io.to(sender.socketId).emit("conversations", conversation);
        });

        receivers.forEach(async (receiver) => {
          // await createOrUpdateMsgCount(data.receiverId, receiver.userId, data.isOnScreen || false);
          const receiverData = {
            authUser: {
              userId: receiver.userId,
            },
          };
          const receiverConversation = await getConversations(receiverData);
          io.to(receiver.socketId).emit("conversations", receiverConversation);
        });
      }
    });

    socket.on("getConversation", async (data) => {
      data.authUser = socket.authUser;
      const conversation = await getConversations(data);
      io.to(socket.id).emit("conversations", conversation);
    });

    socket.on("disconnect", () => {
      console.log(socket.id, "disconnect");
      removeUser(socket.id);
    });
  });
}

module.exports = {
  socketEvent,
  socketAuth,
  getChatById,
  createOrUpdateMsgCount,
};
