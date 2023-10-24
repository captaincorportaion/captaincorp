require("dotenv").config()
module.exports = (sequelize, Sequelize) => {
    const Media = sequelize.define('media', {
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
        url: {
            type: Sequelize.STRING(200),
            allowNull: true,
            get() {
                const rawValue = this.getDataValue('url');
                return rawValue ? ASSETS.getProfileUrl(rawValue) : null;
            }
        },
        type: {
            type: Sequelize.INTEGER(1), // 1=image 2=video
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
        tableName: 'media',
        paranoid: 'true'
    });
    return Media
}
