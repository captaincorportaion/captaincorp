module.exports = (sequelize, Sequelize) => {
    const roommateBooking = sequelize.define('roommate_bookings', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        roommate_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'roommates',
                key: 'id'
            }
        },
        date: {
            type: Sequelize.DATE,
            allowNull: false
        },
        minimum_stay: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        age: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        status: {
            type: Sequelize.ENUM(['Pending', 'Decline', 'Accept']),
            defaultValue: 'Pending'
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
        deletedAt: {
            field: 'deleted_at',
            type: Sequelize.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'roommate_bookings',
        paranoid: "true"
    });
    return roommateBooking
}