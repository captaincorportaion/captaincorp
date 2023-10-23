module.exports = (sequelize, Sequelize) => {

    const Users = sequelize.define('users', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: Sequelize.STRING(200),
            allowNull: true,
        },
        address: {
            type: Sequelize.STRING(200),
            allowNull: true,
        },
        email: {
            type: Sequelize.STRING(200),
            allowNull: true,
        },
        password: {
            type: Sequelize.STRING(200),
            allowNull: true,
        },
        phoneNumber: {
            type: Sequelize.BIGINT(20),
            allowNull: true,
        },
        classYear: {
            type: Sequelize.BIGINT(20),
            allowNull: true,
        },
        course: {
            type: Sequelize.STRING(200),
            allowNull: true,
        },
        device: {
            type: Sequelize.STRING(200),
            allowNull: true,
        },
        picture: {
            type: Sequelize.STRING(255),
            allowNull: true,
            // get() {
            //     const rawValue = this.getDataValue('picture');
            //     return typeof rawValue === 'string' ? ASSETS.getProfileUrl(rawValue) : null;
            // }
            get: function (val) {
                return `https://img.freepik.com/free-photo/close-up-portrait-young-bearded-man-white-shirt-jacket-posing-camera-with-broad-smile-isolated-gray_171337-629.jpg?size=626&ext=jpg&ga=GA1.1.2008272138.1696896000&semt=ais`
                // return `${process.env.BACKEND_URL}/${val}`
            }
        },
        active: {
            type: Sequelize.INTEGER(2),
            allowNull: false,
            defaultValue: 1,
        },
        generateOtp: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        resetTokenExpiry: {
            type: Sequelize.DATE,
            allowNull: true,
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
        tableName: 'users',
        paranoid: "true"
    });

    return Users
}