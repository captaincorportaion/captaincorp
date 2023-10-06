module.exports = (sequelize, Sequelize) => {
    const selectedSocial = sequelize.define('selectedSocials', {
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
        social_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            references: {
                model: 'roommate_socials',
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
        tableName: 'selectedSocials',
        paranoid: "true"
    });
    return selectedSocial
}