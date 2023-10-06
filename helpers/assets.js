"use strict"
const config = require("../config/config")
require('dotenv').config();


module.exports.getProfileUrl = (fileName) => {
    return process.env.APPPATH + fileName;
}


module.exports.getMediaUrl = (fileName, folderName) => {
    return config.appPath + `/images` + `/${folderName}/` + fileName;
}


