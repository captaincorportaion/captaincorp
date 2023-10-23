module.exports = (sequelize, Sequelize) => {
    const Save = sequelize.define('saves', {
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
        roomId: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'rooms',
                key: 'id'
            }
        },
        eventId: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'events',
                key: 'id'
            }
        },
        roommateId: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'roommates',
                key: 'id'
            }
        },
        itemId: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: true,
            references: {
                model: 'items',
                key: 'id'
            }
        },
        post_category: {
            type: Sequelize.STRING,
            enum: ['Room', 'Event', 'Item', 'Roommate'],
            allowNull: true
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
        tableName: 'saves',
    });

    return Save;
}
