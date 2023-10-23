module.exports = (sequelize, Sequelize) => {
    const event = sequelize.define('events', {
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
        is_save: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        event_title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        event_details: {
            type: Sequelize.STRING,
            allowNull: false
        },
        seats: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        date: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },
        time: {
            type: Sequelize.TIME,
            allowNull: false
        },
        price: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        city: {
            type: Sequelize.STRING,
            allowNull: false
        },
        category_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            references: {
                model: 'event_categories',
                key: 'id'
            }
        },
        lat: {
            type: Sequelize.STRING,
            allowNull: false
        },
        long: {
            type: Sequelize.STRING,
            allowNull: false
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
        tableName: 'events',
        paranoid: "true"
    });
    return event
}