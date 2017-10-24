const express = require("express");
const fs = require("fs");
const moment = require("moment");
const config = require("../comm/config.json");

const router =  express.Router();

function getDomainUrl(path) {
    let url = "http://wjflv.myskcdn.co.kr/hlsmedia/_definst_/hlsmedia"+path+"/playlist.m3u8";

    return url;
}

function fncData(req, res) {
    res.render("hls", {"max_buffer_size":config.max_buffer_size_k});
}

function fncDetailData(req, res) {
    let now = moment().format("YYYYMMDD");

    let fileName = "all_hls_data.log";
    let fileData = fs.readFileSync("../data/" + fileName, "utf-8").split("||;");

    let arrData = [];
    let arrDataName = [];
    let num = 1;

    for (var i = 2; i < fileData.length; i++) {
        var item = fileData[fileData.length-i];
        let data = item.split("||");
        if(arrDataName.indexOf(data[3]) == -1) {
            // test 할 link url
            let rootPath = data[3].split("/");
            let pathStr = "";
            for (let i = 2; i < rootPath.length; i++) {
                pathStr = pathStr + "/" + rootPath[i];
            }
            let domainUrl = getDomainUrl(pathStr);

            arrDataName.push(data[3]);
            arrData.push({"num": num, "date": data[0], "time": data[1], "name": data[3], "url": domainUrl});
            num++;
        }
        if(arrData.length >= 30) {
            break;
        }
    }
    res.send({"arrData":arrData});
}

router.get("/", fncData);
router.get("/list", fncDetailData);

module.exports = router;