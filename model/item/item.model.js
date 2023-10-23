module.exports = (sequelize, Sequelize) => {
    const item = sequelize.define('items', {
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
        item_type: {
            type: Sequelize.STRING,
            enum: ['Rent', 'Sale'],
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false
        },
        price: {
            type: Sequelize.INTEGER,
            allowNull: true,
            default: null
        },
        city: {
            type: Sequelize.STRING,
            allowNull: false
        },
        price_duration: {
            type: Sequelize.STRING,
            allowNull: true,
            default: null,
            enum: ['per day', null],
        },
        security_deposite: {
            type: Sequelize.INTEGER,
            allowNull: true,
            default: null
        },
        item_category_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            references: {
                model: 'items_categories',
                key: 'id'
            }
        },
        is_save: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        lat: {
            type: Sequelize.STRING,
            allowNull: false
        },
        long: {
            type: Sequelize.STRING,
            allowNull: false
        },
        address: {
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
        tableName: 'items',
        paranoid: "true"
    });
    return item
}