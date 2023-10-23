module.exports = (sequelize, Sequelize) => {
    const roommateMedial = sequelize.define('room_medias', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        media_type: {
            type: Sequelize.INTEGER,
            enum: [1, 2], //1 = photo , 2 = video
        },
        roommate_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            references: {
                model: "roommates",
                key: 'id'
            }
        },
        media: {
            type: Sequelize.STRING,
            allowNull: true,
            // get() {
            //     const rawValue = this.getDataValue('media');
            //     return rawValue ? ASSETS.getMediaUrl(rawValue, "roommate_media") : null;
            // }
            get: function (val) {
                return `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHO7H7rzu9mGq5t0wRo79Z_2_Y4H_FKpyrpSjzD58ZroLaU6iqxqyLTnF8u5Nv3gfyeCg&usqp=CAU`
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
        tableName: 'room_medias',
        paranoid: "true"
    });
    return roommateMedial
}