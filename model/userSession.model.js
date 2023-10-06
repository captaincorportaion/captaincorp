let suid = require('rand-token').suid;

module.exports = (sequelize, Sequelize) => {
    const UserSession = sequelize.define('user_sessions', {
        id: {
            type: Sequelize.BIGINT.UNSIGNED,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        user_id: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        token: {
            type: Sequelize.STRING(500),
        },
        // tokenExpiry: {
        //     type: Sequelize.DATE,
        //     select: false,
        // },
        createdAt: {
            field: 'created_at',
            type: Sequelize.DATE,
            allowNull: true,
        },
        updatedAt: {
            field: 'updated_at',
            type: Sequelize.DATE,
            allowNull: true,
        },
        deleteAt: {
            field: 'deleted_at',
            type: Sequelize.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'user_sessions',
        paranoid: 'true'
    });

    UserSession.createToken = async function (userId) {
        let userSession = await UserSession.create({
            token: userId + suid(99),
            user_id: userId,
        });
        return userSession.token;
    };

    UserSession.prototype.toJSON = function () {
        let values = Object.assign({}, this.get());
        values.created_at = values.created_at;
        values.updated_at = values.updated_at;
        ['created_at', 'updated_at'].forEach(e => delete values[e]);
        return values;
    };
    return UserSession;
}

