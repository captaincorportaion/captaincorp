module.exports = (sequelize, Sequelize) => {
    const saleItemBooking = sequelize.define('sale_item_bookings', {
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
        item_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'items',
                key: 'id'
            }
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
        tableName: 'sale_item_bookings',
        paranoid: "true"
    });
    return saleItemBooking
}