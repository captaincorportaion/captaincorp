module.exports = (sequelize, Sequelize) => {
    const Card = sequelize.define('card', {
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
        card_number: {
            type: Sequelize.STRING,
            allowNull: false
        },
        expiry_month: {
            type: Sequelize.STRING,
            allowNull: false
        },
        expiry_year: {
            type: Sequelize.STRING,
            allowNull: false
        },
        cvc: {
            type: Sequelize.STRING,
            allowNull: false
        },
        cardholder_name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        active: {
            type: Sequelize.INTEGER(2),
            allowNull: false,
            defaultValue: 1,
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
        }
    }, {
        tableName: 'card',
        paranoid: "true"
    });
    return Card
}