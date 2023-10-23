let fs = require("fs");
let path = require("path");
const config = require("../config/config");
let suid = require("rand-token").suid;
let uid = require("rand-token").uid;

function imageUpload(fileObjArray, pathFolder = "room_image") {
    let imagearr = [];
    for (let index = 0, len = fileObjArray.length; index < len; ++index) {
        if (fileObjArray[index].fieldname === "mediaImg") {
            console.log('fileObjArray[index]', fileObjArray[index])
            const image = uid(16) + path.extname(fileObjArray[index].originalname);
            const uploadPath = "./public/" + pathFolder + "/" + image;
            const outStream = fs.createWriteStream(uploadPath);
            outStream.write(fileObjArray[index].buffer);
            outStream.end();

            imagearr.push(image);
        }
    }
    return imagearr;
}

function videoUpload(fileObjArray, pathFolder = "video") {
    let imagearr = [];
    for (let index = 0, len = fileObjArray.length; index < len; ++index) {
        if (fileObjArray[index].fieldname === "mediaVideo") {
            const image = uid(16) + path.extname(fileObjArray[index].originalname);
            const uploadPath = "./public/" + pathFolder + "/" + image;
            const outStream = fs.createWriteStream(uploadPath);
            outStream.write(fileObjArray[index].buffer);
            outStream.end();

            imagearr.push(image);
        }
    }
    return imagearr;
}
function isArrayDefine(fileObjArray) {
    if (typeof fileObjArray !== 'undefined' && fileObjArray.length > 0) {
        return true;
    }
    return false;
}


function uploadProfileImage(fileObjArray, pathFolder = "profile_image") {
    let profileImage = null;
    // console.log(fileObjArray);
    for (let index = 0, len = fileObjArray.length; index < len; ++index) {
        if (fileObjArray[index].fieldname == 'picture') {
            if (isArrayDefine(fileObjArray)) {
                profileImage = uid(16) + path.extname(fileObjArray[index].originalname);
                let uploadPath = './public/' + pathFolder + '/' + profileImage;
                if (!fs.existsSync('./public/' + pathFolder)) {
                    fs.mkdirSync('./public/' + pathFolder, {
                        recursive: true
                    });
                }
                let outStream = fs.createWriteStream(uploadPath);
                outStream.write(fileObjArray[0].buffer);
                outStream.end();
            }
        }
    }
    return profileImage;
}


function uploadRoommateFiles(fileObjArray, pathFolder = "roommate_media") {
    let imagearr = [];
    for (let index = 0, len = fileObjArray.length; index < len; ++index) {
        const roommate_media = uid(16) + path.extname(fileObjArray[index].originalname);
        const uploadPath = "./public/" + pathFolder + "/" + roommate_media;
        const outStream = fs.createWriteStream(uploadPath);
        outStream.write(fileObjArray[index].buffer);
        outStream.end();
        let data = { roommate_media }
        if (fileObjArray[index].fieldname === "image") {
            data.media_type = 1
        } else {
            data.media_type = 2
        }
        imagearr.push(data);
    }
    return imagearr;
}


function UploadFiles(fileObjArray, pathFolder = "images", fieldname) {
    let imagearr = [];
    for (let index = 0, len = fileObjArray.length; index < len; ++index) {
        if (fileObjArray[index].fieldname === fieldname) {
            const image = uid(16) + path.extname(fileObjArray[index].originalname);
            const uploadPath = "./public/" + pathFolder + "/" + image;
            const outStream = fs.createWriteStream(uploadPath);
            outStream.write(fileObjArray[index].buffer);
            outStream.end();

            imagearr.push(image);
        }
    }
    return imagearr;
}


module.exports = { imageUpload, videoUpload, uploadProfileImage, uploadRoommateFiles, UploadFiles };
