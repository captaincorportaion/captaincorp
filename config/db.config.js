const config = require('./config')
const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.database.database, config.database.username, config.database.password, {
    host: config.database.host,
    dialect: process.env.DB_DIALECT,
    operatorsAliases: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: false
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// --------------------------------- Models/Table --------------------------------------------//

// api logs 
db.api_logs = require('../model/api_logs.model')(sequelize, Sequelize)

//user
db.users = require('../model/user.model')(sequelize, Sequelize)
db.user_sessions = require('../model/userSession.model')(sequelize, Sequelize)

//room
db.houseAmenities = require('../model/room/amenities.model')(sequelize, Sequelize)
db.room_amenities = require('../model/room/roomAmenities.model')(sequelize, Sequelize)
db.media = require('../model/media.model')(sequelize, Sequelize)
db.room_rules = require('../model/room/roomRules.model')(sequelize, Sequelize)
db.houseRules = require('../model/room/rules.model')(sequelize, Sequelize)
db.rooms = require('../model/room/room.model')(sequelize, Sequelize)

//save post
db.saves = require('../model/savepost/savePost.model')(sequelize, Sequelize)
db.media = require('../model/media.model')(sequelize, Sequelize)
db.room_booking = require('../model/room/room_booking.model')(sequelize, Sequelize);

//...............event 
db.event_categories = require('../model/event/event_categories.model')(sequelize, Sequelize);
db.event_amenities = require('../model/event/event_amenities.model')(sequelize, Sequelize);
db.event = require('../model/event/event.model')(sequelize, Sequelize);
db.event_photos = require('../model/event/event_photo.model')(sequelize, Sequelize);
db.event_booking = require('../model/event/event_booking.model')(sequelize, Sequelize);
db.selected_amenities = require('../model/event/selected_event_amenities.model')(sequelize, Sequelize);

//.................items 
db.items_categories = require('../model/item/item_categories.model')(sequelize, Sequelize);
db.items = require('../model/item/item.model')(sequelize, Sequelize);
db.item_photos = require('../model/item/item_photo.model')(sequelize, Sequelize);
db.rent_item_booking = require('../model/item/rent_item_booking.model')(sequelize, Sequelize);
db.sale_item_booking = require('../model/item/sale_item_booking.model')(sequelize, Sequelize);

//...............roommate 
db.roommate_interests = require('../model/roommate/roommate_interests.model')(sequelize, Sequelize);
db.roommate_socials = require('../model/roommate/roommate_social.model')(sequelize, Sequelize);
db.roommate = require('../model/roommate/roommate.model')(sequelize, Sequelize);
db.roommate_media = require('../model/roommate/roommate_media.model')(sequelize, Sequelize)
db.selectedInterest = require('../model/roommate/selected_interest.model')(sequelize, Sequelize);
db.selectedSocials = require('../model/roommate/selected_social.model')(sequelize, Sequelize);
db.lifestyle = require('../model/roommate/lifestyle.model')(sequelize, Sequelize);
db.selectedLifestyle = require('../model/roommate/selected_lifestyle.model')(sequelize, Sequelize);
db.roommate_booking = require('../model/roommate/roommate_booking.model')(sequelize, Sequelize);

//card
db.card = require('../model/card/card.model')(sequelize, Sequelize);

//chat
db.conversations = require('../model/chat/conversations.model')(sequelize, Sequelize);
db.conversations_chat = require('../model/chat/conversations_chat.model')(sequelize, Sequelize);
db.msg_count_converastion = require('../model/chat/message_count.model')(sequelize, Sequelize);
//..........................relation................................

// db.rooms.hasMany(db.room_amenities, { foreignKey: 'amenitieId' });
// db.room_amenities.belongsTo(db.rooms, { foreignKey: 'amenitieId' });

//room
db.users.hasMany(db.rooms, { foreignKey: 'user_id' });
db.rooms.belongsTo(db.users, { foreignKey: 'user_id' });

db.media.belongsTo(db.rooms, { foreignKey: "roomId" });
db.rooms.hasMany(db.media, { foreignKey: "roomId" });

db.room_amenities.belongsTo(db.rooms, { foreignKey: "roomId", as: 'roomAmenities' });
db.rooms.hasMany(db.room_amenities, { foreignKey: "roomId", as: 'roomAmenities' });

db.room_rules.belongsTo(db.rooms, { foreignKey: 'roomId', as: 'roomRules' });
db.rooms.hasMany(db.room_rules, { foreignKey: 'roomId', as: 'roomRules' });

db.rooms.hasMany(db.room_booking, { foreignKey: 'room_id' });
db.room_booking.belongsTo(db.rooms, { foreignKey: 'room_id' });

db.users.hasMany(db.room_booking, { foreignKey: 'user_id' });
db.room_booking.belongsTo(db.users, { foreignKey: 'user_id' });

db.houseRules.hasMany(db.room_rules, { foreignKey: 'rulesId', as: 'houserules' });
db.room_rules.belongsTo(db.houseRules, { foreignKey: 'rulesId', as: 'houserules' });

db.houseAmenities.hasMany(db.room_amenities, { foreignKey: 'amenitieId', as: 'houseamenitie' });
db.room_amenities.belongsTo(db.houseAmenities, { foreignKey: 'amenitieId', as: 'houseamenitie' });


//save post
db.rooms.hasMany(db.saves, { foreignKey: "roomId", as: 'room' });
db.saves.belongsTo(db.rooms, { foreignKey: "roomId", as: 'room' });

db.event.hasMany(db.saves, { foreignKey: "eventId", as: 'event' });
db.saves.belongsTo(db.event, { foreignKey: "eventId", as: 'event' });

db.roommate.hasMany(db.saves, { foreignKey: "roommateId", as: 'roommate' });
db.saves.belongsTo(db.roommate, { foreignKey: "roommateId", as: 'roommate' });

db.items.hasMany(db.saves, { foreignKey: "itemId", as: 'item' });
db.saves.belongsTo(db.items, { foreignKey: "itemId", as: 'item' });

//event 
db.users.hasMany(db.event, { foreignKey: 'user_id' });
db.event.belongsTo(db.users, { foreignKey: 'user_id' });

db.event.hasMany(db.event_photos, { foreignKey: 'event_id' });
db.event_photos.belongsTo(db.event, { foreignKey: 'event_id' });

db.event_categories.hasMany(db.event, { foreignKey: 'category_id' });
db.event.belongsTo(db.event_categories, { foreignKey: 'category_id' });

db.event.hasMany(db.selected_amenities, { foreignKey: 'event_id' });
db.selected_amenities.belongsTo(db.event, { foreignKey: 'event_id' });

db.event_amenities.hasMany(db.selected_amenities, { foreignKey: 'event_amenities_id' });
db.selected_amenities.belongsTo(db.event_amenities, { foreignKey: 'event_amenities_id' });

db.event.hasMany(db.event_booking, { foreignKey: 'event_id' });
db.event_booking.belongsTo(db.event, { foreignKey: 'event_id' });

db.users.hasMany(db.event_booking, { foreignKey: 'user_id' });
db.event_booking.belongsTo(db.users, { foreignKey: 'user_id' });


//item
db.items_categories.hasMany(db.items, { foreignKey: 'item_category_id' });
db.items.belongsTo(db.items_categories, { foreignKey: 'item_category_id' });

db.items.hasMany(db.item_photos, { foreignKey: 'items_id' });
db.item_photos.belongsTo(db.items, { foreignKey: 'items_id' });

db.users.hasMany(db.items, { foreignKey: 'user_id' });
db.items.belongsTo(db.users, { foreignKey: 'user_id' });

db.users.hasMany(db.rent_item_booking, { foreignKey: 'user_id' });
db.rent_item_booking.belongsTo(db.users, { foreignKey: 'user_id' });

db.items.hasMany(db.rent_item_booking, { foreignKey: 'item_id' });
db.rent_item_booking.belongsTo(db.items, { foreignKey: 'item_id' });

db.users.hasMany(db.sale_item_booking, { foreignKey: 'user_id' });
db.sale_item_booking.belongsTo(db.users, { foreignKey: 'user_id' });

db.items.hasMany(db.sale_item_booking, { foreignKey: 'item_id' });
db.sale_item_booking.belongsTo(db.items, { foreignKey: 'item_id' });

//roommate
db.users.hasMany(db.roommate, { foreignKey: 'user_id' });
db.roommate.belongsTo(db.users, { foreignKey: 'user_id' });

db.roommate.hasMany(db.roommate_media, { foreignKey: 'roommate_id' });
db.roommate_media.belongsTo(db.roommate, { foreignKey: 'roommate_id' });

db.roommate.hasMany(db.selectedInterest, { foreignKey: 'roommate_id' });
db.selectedInterest.belongsTo(db.roommate, { foreignKey: 'roommate_id' });

db.roommate.hasMany(db.selectedSocials, { foreignKey: 'roommate_id' });
db.selectedSocials.belongsTo(db.roommate, { foreignKey: 'roommate_id' });

db.roommate.hasMany(db.selectedLifestyle, { foreignKey: 'roommate_id' });
db.selectedLifestyle.belongsTo(db.roommate, { foreignKey: 'roommate_id' });

db.roommate_interests.hasMany(db.selectedInterest, { foreignKey: 'interest_id' });
db.selectedInterest.belongsTo(db.roommate_interests, { foreignKey: 'interest_id' });

db.roommate_socials.hasMany(db.selectedSocials, { foreignKey: 'social_id' });
db.selectedSocials.belongsTo(db.roommate_socials, { foreignKey: 'social_id' });

db.lifestyle.hasMany(db.selectedLifestyle, { foreignKey: 'lifestyle_id' });
db.selectedLifestyle.belongsTo(db.lifestyle, { foreignKey: 'lifestyle_id' });

db.roommate.hasMany(db.roommate_booking, { foreignKey: 'roommate_id' });
db.roommate_booking.belongsTo(db.roommate, { foreignKey: 'roommate_id' });

db.users.hasMany(db.roommate_booking, { foreignKey: 'user_id' });
db.roommate_booking.belongsTo(db.users, { foreignKey: 'user_id' });


//chat
db.conversations.belongsTo(db.users, { foreignKey: 'sender_id', as: 'sender' });
db.users.hasMany(db.conversations, { foreignKey: 'sender_id', as: 'sender' });

db.conversations.belongsTo(db.users, { foreignKey: 'receiver_id', as: 'receiver' });
db.users.hasMany(db.conversations, { foreignKey: 'receiver_id', as: 'receiver' });

db.conversations_chat.belongsTo(db.users, { foreignKey: 'sender_id' });
db.users.hasMany(db.conversations_chat, { foreignKey: 'sender_id' });

db.conversations_chat.belongsTo(db.conversations, { foreignKey: 'conversations_id', as: 'chat' });
db.conversations.hasMany(db.conversations_chat, { foreignKey: 'conversations_id', as: 'chat' });


db.sequelize.sync({ alert: true });

module.exports = db;
