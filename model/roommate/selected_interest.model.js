module.exports = (sequelize, Sequelize) => {
    const selectedInterest = sequelize.define('selectedInterests', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        roommate_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            references: {
                model: 'roommates',
                key: 'id'
            }
        },
        interest_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            references: {
                model: 'roommate_interests',
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
        deletedAt: {
            field: 'deleted_at',
            type: Sequelize.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'selectedInterests',
        paranoid: "true"
    });
    return selectedInterest
}