module.exports = (sequelize, Sequelize) => {
    const itemsPhoto = sequelize.define('items_photos', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        items_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            references: {
                model: "items",
                key: 'id'
            }
        },
        photo: {
            type: Sequelize.TEXT,
            allowNull: false,
            get() {
                const rawValue = this.getDataValue('photo');
                return rawValue ? ASSETS.getMediaUrl(rawValue, "item_images") : null;
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
        tableName: 'items_photos',
        paranoid: "true"
    });
    return itemsPhoto
}