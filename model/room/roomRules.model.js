const db = require('../../config/db.config');
// const Amenities = db.amenities;
module.exports = (sequelize, Sequelize) => {
    const RoomRules = sequelize.define('room_rules', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        roomId: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'rooms',
                key: 'id'
            }
        },
        rulesId: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'houseAmenities',
                key: 'id'
            }
        },
        createdAt: {
            field: 'created_at',
            type: Sequelize.DATE,
            allowNull: false,
        },
        updatedAt: {
            field: 'updated_at',
            type: Sequelize.DATE,
            allowNull: false,
        },
    }, {
        tableName: 'room_rules',
    });


    return RoomRules
}
