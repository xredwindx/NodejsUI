const express = require("express");
const fs = require("fs");
const moment = require("moment");
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

    let nowUI = moment().format("YYYY-MM-DD");

    res.render("syncList", {"now":nowUI, "radioType":radioType});
}

function fncDetailData(req, res) {
    let radioType = req.body.radioType;
    if (radioType == undefined) {
        radioType = "f";
    }
    let now = moment().format("YYYYMMDD");
    // let nowLog = moment().format("YYYY-MM-DD HH:mm:ss");

    let fileName = "data_" + now + ".log";
    let fileData = fs.readFileSync("../data/" + fileName, "utf-8").split("||;");

    let fileRetryName = "retry_data_" + now + ".log";
    let fileRetryData = fs.readFileSync("../data/" + fileRetryName, "utf-8").split("\n");

    let retryArrData = [];
    for(let r=0 ; r < fileRetryData.length ; r++) {
        let rItem = fileRetryData[r];
        if(rItem.trim() == "") {
            continue;
        }

        let rData = rItem.split(" ");

        // errno 가져오기
        let errData = rData[3].split("=");
        let errNo = errData[1];

        // status check
        let rStatus = "X";
        if (rData[1] == "SUCCESS") {
            rStatus = "O";
        } else if (errNo == 23) {
            rStatus = "E";
        }

        // name 가져오기
        let name = "";
        let nameData = rData[2].split("/");
        for(let n=1 ; n < nameData.length ; n++) {
            name += "/"+nameData[n];
        }

        retryArrData.push({"date":rData[0], "status":rStatus, "name":name, "err":errNo});
    }

    let arrData = [];
    let arrDataName = [];
    let num = 1;
    let successCount = 0;
    let failedCount = 0;
    let exCount = 0;

    for (let i = 2; i < fileData.length; i++) {
        let item = fileData[fileData.length-i];

        let data = item.split("||");
        if(arrDataName.indexOf(data[2]) == -1) {
            let msg = "";

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
                for(let x=0 ; x < retryArrData.length ; x++) {
                    let reData = retryArrData[x];
                    if(data[2].trim().toUpperCase() == reData.name.trim().toUpperCase()) {
                        data[0] = reData.date;
                        status = reData.status;
                        msg =  getSyncErrMsg(reData.err);
                        break;
                    }
                }
            }

            // status check
            if (status == "O") {
                successCount++;
            } else if (status == "X") {
                failedCount++;
            } else if (status == "E") {
                exCount++;
            }

            if (radioType == "all") {
                if (status != "E") {
                    arrData.push({"num": num, "date": data[0], "status": status, "name": data[2], "url": domainUrl, "msg": msg});
                    num++;
                }
            } else if (radioType == "f") {
                if (status == "X") {
                    arrData.push({"num": num, "date": data[0], "status": status, "name": data[2], "url": domainUrl, "msg": msg});
                    num++;
                }
            } else if (radioType == "e") {
                if (status == "E") {
                    arrData.push({"num": num, "date": data[0], "status": status, "name": data[2], "url": domainUrl, "msg": msg});
                    num++;
                }
            }

            arrDataName.push(data[2]);
        }
    }

    let totalCount = successCount + failedCount;
    // console.log("total : "+totalCount+" success : "+successCount+" fail : "+failedCount);
    let percent = (successCount / totalCount) * 100;

    let returnData = {"arrData":arrData, "totalCnt":numeral(totalCount).format('0,0'), "successCnt":numeral(successCount).format('0,0')
        , "failedCnt":numeral(failedCount).format('0,0'), "exCnt":numeral(exCount).format('0,0'), "percent": percent.toFixed(2)};

    res.send(returnData);
}

router.get("/", fncData);
router.post("/list", fncDetailData);

module.exports = router;