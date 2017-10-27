const express = require("express");
const fs = require("fs");
const moment = require("moment");
const numeral = require("numeral");
const cp = require("child_process");

const router =  express.Router();

function getDomainUrl(param, path) {
    let url = "";
    if (param == "WJTH_DOWNLOAD") {
        url = "http://thinkudn3-wjdn.myskcdn.co.kr"+path;
    } else if (param == "WJTH_CACHE") {
        url = "http://thinkbigch-wjch.myskcdn.co.kr"+path;
    } else if (param == "WJTH_HLS") {
        url = "http://wjflv.myskcdn.co.kr/hlsmedia/_definst_"+path+"/playlist.m3u8";
    } else if (param == "WJTH_RTSP") {
        url = "mms://wjwmv.myskcdn.co.kr/media"+path;
    }
    return url;
}

function osCmd(status, now, path) {
    let cmd = 'cat /usr/service/wjsyncweb/data/wj2solbox_full_syncd_'+now+'.log | grep "'+path+'" | grep "[COMPLETED SUCCESS]" | wc -l';
    // console.log(cmd);
    try {
        let child = cp.execSync(cmd);
        if(parseInt(child.toString(), 10) > 0) {
            status = "O";
        }
    } catch(exception) {
        console.log("#################### os cmd exception ###########################");
        console.log(exception);
    }
    // console.log("osCmd status : "+status);
    return status;
}

function fncData(req, res) {
    let radioType = req.query.radioType;
    if (radioType == undefined) {
        radioType = "f";
    }
    let now = moment().format("YYYYMMDD");
    let nowUI = moment().format("YYYY-MM-DD");
    // let nowLog = moment().format("YYYY-MM-DD HH:mm:ss");

    let fileName = "data_" + now + ".log";
    let fileData = fs.readFileSync("../data/" + fileName, "utf-8").split("||;");

    let successCount = 0;
    let failedCount = 0;
    let arrDataName = [];

    for (var i = 2; i < fileData.length; i++) {
        var item = fileData[fileData.length-i];
        let data = item.split("||");
        if(arrDataName.indexOf(data[2]) == -1) {
            // status check
            let status = "X";
            if (data[1] == "SUCCESS") {
                status = "O";
            }

            // 실패일 경우 한번 더 체크
            if(status == "X") {
                status = osCmd(status, now, data[2]);
            }

            // status check
            if (status == "O") {
                successCount++;
            } else {
                failedCount++;
            }

            arrDataName.push(data[2]);
        }
    }
    let totalCount = successCount + failedCount;
    // console.log("total : "+totalCount+" success : "+successCount+" fail : "+failedCount);
    let percent = (successCount / totalCount) * 100;

    res.render("syncList20171026", {"totalCnt":numeral(totalCount).format('0,0'), "successCnt":numeral(successCount).format('0,0')
        , "failedCnt":numeral(failedCount).format('0,0'), "percent": percent.toFixed(2), "now":nowUI, "radioType":radioType});
}

function fncDetailData(req, res) {
    let radioType = req.query.radioType;
    if (radioType == undefined) {
        radioType = "f";
    }
    let now = moment().format("YYYYMMDD");

    let fileName = "data_" + now + ".log";
    let fileData = fs.readFileSync("../data/" + fileName, "utf-8").split("||;");

    let arrData = [];
    let arrDataName = [];
    let num = 1;

    for (var i = 2; i < fileData.length; i++) {
        var item = fileData[fileData.length-i];

        let data = item.split("||");
        if(arrDataName.indexOf(data[2]) == -1) {
            // test 할 link url
            let rootPath = data[2].split("/");
            let pathStr = "";
            for (let i = 2; i < rootPath.length; i++) {
                pathStr = pathStr + "/" + rootPath[i];
            }
            let domainUrl = getDomainUrl(rootPath[1], pathStr);

            // status check
            let status = "X";
            if (data[1] == "SUCCESS") {
                status = "O";
            }
            // 실패일 경우 한번 더 체크
            if(status == "X") {
                status = osCmd(status, now, data[2]);
            }

            if (radioType == "all") {
                arrData.push({"num": num, "date": data[0], "status": status, "name": data[2], "url": domainUrl});
                num++;
            } else {
                if (status == "X") {
                    arrData.push({"num": num, "date": data[0], "status": status, "name": data[2], "url": domainUrl});
                    num++;
                }
            }

            arrDataName.push(data[2]);
        }
    }

    res.send({"arrData":arrData});
}

router.get("/", fncData);
router.get("/list", fncDetailData);

module.exports = router;