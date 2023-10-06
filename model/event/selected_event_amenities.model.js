module.exports = (sequelize, Sequelize) => {
    const selectedAmenities = sequelize.define('selected_amenities', {
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
        event_amenities_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            references: {
                model: "event_amenities",
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
        tableName: 'selected_amenities',
        paranoid: "true"
    });
    return selectedAmenities
}