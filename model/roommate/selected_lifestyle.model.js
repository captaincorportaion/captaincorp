module.exports = (sequelize, Sequelize) => {
    const selectedLifestyle = sequelize.define('selectedLifestyles', {
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
        lifestyle_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            references: {
                model: 'lifestyles',
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
        tableName: 'selectedLifestyles',
        paranoid: "true"
    });
    return selectedLifestyle
}