const express = require("express");
const fs = require("fs");

const router =  express.Router();

function getUrl(path) {
    let urlStr = "http://";
    let pathData = path.split("/");

    let content = "";
    for (let i=2 ; i < pathData.length ; i++) {
        content += "/"+pathData[i];
    }

    if (pathData[1] == "WJTH_DOWNLOAD") {
        urlStr += "down.wjthinkbig.com" + content;
    } else if (pathData[1] == "WJTH_CACHE") {
        urlStr += "cache.wjthinkbig.com" + content;
    } else if (pathData[1] == "WJTH_HLS") {
        urlStr += "hlsmedia.wjthinkbig.com/hlsmedia/_definst_/mp4:hlsmedia" + content + "/playlist.m3u8";
    } else {
        urlStr = path;
    }
    return urlStr;
}

function fncFailChk(req, res) {
    let dateParam = req.params.dateParam;
    let fileName = "fail_list_" + dateParam + ".log";
    let fileData = fs.readFileSync("../data/" + fileName, "utf-8").split("\n");

    let returnData = [];
    for (let i=0 ; i < fileData.length ; i++) {
        let item = fileData[i];
        if(item.trim() == "") {
            continue;
        }

        let data = item.split(" ");

        // errno 가져오기
        let errData = data[5].split("=");
        let errNo = errData[1].replace(/\)/g,"");

        if(errNo == 23) {
            returnData.push({"url": getUrl(data[2])})
        }
    }
    res.status(200).send(returnData);
}

router.get("/:dateParam", fncFailChk);

module.exports = router;