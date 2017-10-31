const express = require("express");
const fs = require("fs");
const numeral = require("numeral");

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

function getSyncErrMsg(num) {
    let msg = "";

    if(num == 23) {
        msg = "not found";
    } else if(num == 10) {
        msg = "connection timeout";
    } else if(num == 12) {
        msg = "session timeout";
    }

    return msg;
}

function fncData(req, res) {
    let radioType = req.query.radioType;
    if (radioType == undefined) {
        radioType = "f";
    }

    let now = req.params.dateParam;
    let nowUI = now.substring(0,4).toString() + "-" + now.substring(4,6).toString() + "-" + now.substring(6,8).toString();

    res.render("syncBeforeList", {"dateParam":now, "now":nowUI, "radioType":radioType});
}

function fncDataInfo(req, res) {
    let radioType = req.body.radioType;
    if (radioType == undefined) {
        radioType = "f";
    }
    let now = req.body.dateParam;

    let fileName1 = "sync_data_success_" + now + ".log";
    let fileData1 = fs.readFileSync("../data/" + fileName1, "utf-8").split("\n");

    let fileName2 = "sync_full_chk_data_" + now + ".log";
    let fileData2 = fs.readFileSync("../data/" + fileName2, "utf-8").split("\n");

    // 파일 합치기
    let fullData = [];
    fileData1.forEach(function(item) {
        if(item.trim() != "") {
            fullData.push(item);
        }
    });

    let arrData = [];
    let successCount = 0;
    let failedCount = 0;
    let exCount = 0;

    // 성공 먼저 처리
    for (var i = 0; i < fullData.length; i++) {
        var item = fullData[i];

        let data = item.split(" ");

        // test 할 link url
        let rootPath = data[2].split("/");
        let pathStr = "";
        for (let i = 2; i < rootPath.length; i++) {
            pathStr = pathStr + "/" + rootPath[i];
        }
        let domainUrl = getDomainUrl(rootPath[1], pathStr);

        successCount++;

        if (radioType == "all") {
            arrData.push({"date": data[0], "status": "O", "name": data[2], "url": domainUrl, "msg": ""});
        }
    }

    // full 처리
    for (var i = 0; i < fileData2.length; i++) {
        var item = fileData2[i];

        let data = item.split(" ");

        // errno 가져오기
        let errData = data[5].split("=");
        let errNo = errData[1].replace(/\)/g,"");

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
        } else if (errNo == 23) {
            status = "E";
        }

        // status check
        if (status == "O") {
            successCount++;
        } else if (status == "X") {
            failedCount++;
        } else if (status == "E") {
            exCount++;
        }

        // error msg
        let msg = getSyncErrMsg(errNo);

        if (radioType == "all") {
            if (status != "E") {
                arrData.push({"date": data[0], "status": status, "name": data[2], "url": domainUrl, "msg": msg});
            }
        } else if (radioType == "f") {
            if (status == "X") {
                arrData.push({"date": data[0], "status": status, "name": data[2], "url": domainUrl, "msg": msg});
            }
        } else if (radioType == "e") {
            if (status == "E") {
                arrData.push({"date": data[0], "status": status, "name": data[2], "url": domainUrl, "msg": msg});
            }
        }
    }

    //정렬
    arrData.sort(function(a,b) {
       return b["date"].replace(/:/g,"") - a["date"].replace(/:/g,"");
    });

    let totalCount = successCount + failedCount;
    // console.log("total : "+totalCount+" success : "+successCount+" fail : "+failedCount);
    let percent = Math.floor((successCount / totalCount) * 10000)/100;

    var returnData = {"arrData":arrData, "totalCnt":numeral(totalCount).format('0,0'), "successCnt":numeral(successCount).format('0,0')
        , "failedCnt":numeral(failedCount).format('0,0'), "exCnt":numeral(exCount).format('0,0'), "percent": percent.toFixed(2)};
    res.send(returnData);
}

router.get("/:dateParam", fncData);
router.post("/list", fncDataInfo);

module.exports = router;