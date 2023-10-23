module.exports = (sequelize, Sequelize) => {
    const eventPhoto = sequelize.define('event_photos', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        event_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            references: {
                model: "events",
                key: 'id'
            }
        },
        photo: {
            type: Sequelize.TEXT,
            allowNull: false,
            // get() {
            //     const rawValue = this.getDataValue('photo');
            //     return rawValue ? ASSETS.getMediaUrl(rawValue, "event_images") : null;
            // }
            get: function (val) {
                return `https://www.bandbaajabarat.com/images/vendors/1630865366screenshot-1075.png`
                // return `${process.env.BACKEND_URL}/${val}`
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
        tableName: 'event_photos',
        paranoid: "true"
    });
    return eventPhoto
}