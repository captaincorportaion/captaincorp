require('dotenv').config();

module.exports = {

    protocol: process.env.PROTOCOL || 'https',
    appPath: process.env.APPPATH,
    database: {
        database: process.env.DB_DATABASE || 'captaincorportaion',
        username: process.env.DB_USERNAME || 'captaincorporationadm',
        password: process.env.DB_PASSWORD || 'YesYouCan007@#ashtag123',
        host: process.env.DB_HOST || 'captaincorp.mysql.database.azure.com',
        dialect: process.env.DB_DIALECT || 'mysql',
    },
    sslCertificates: {
        privkey: process.env.PRIVKEY ||'./privkey.pem',
        fullchain: process.env.FULLCHAIN || './fullchain.pem'
    },
    email: {
        fromEmail: process.env.EMAIL_FROM || "captaincorporationboston@gmail.com",
    },
};
