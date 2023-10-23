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
            // get() {
            //     const rawValue = this.getDataValue('url');
            //     return rawValue ? ASSETS.getProfileUrl(rawValue) : null;
            // }
            get: function (val) {
                return `https://media.istockphoto.com/id/1444437242/photo/side-view-of-elegant-bedroom-interior-with-double-bed-television-set-night-table-and-seaview.jpg?s=612x612&w=0&k=20&c=rvg5KUXPKIMY4I1g0by2Rpr0Cj4sCo-228M5LU-OPmE=`
                // return `${process.env.BACKEND_URL}/${val}`
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
