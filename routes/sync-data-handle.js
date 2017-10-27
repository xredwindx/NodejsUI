const express = require("express");
const fs = require("fs");
const moment = require("moment");

const router =  express.Router();

function fncData(req, res) {
    let dateParam = req.params.dateParam;
    let now = moment().format("YYYYMMDD");

    let fileName = "sync_data_failure_" + dateParam + ".log";
    let fileData = fs.readFileSync("../data/" + fileName, "utf-8").split("\n");

    let fileFullName = "sync_full_data_u_" + now + ".log";
    let fileFullData = fs.readFileSync("../data/" + fileFullName, "utf-8").split("\n");

    let arrData = [];
    for(let i=0 ; i < fileData.length ; i++) {
        let item = fileData[i];

        for(let j=0 ; j < fileFullData.length ; j++) {
            let fullItem = fileFullData[j];
            let data = fullItem.split(" ");
            if(data[2] == item) {
                arrData.push(fullItem);
            }
        }
    }

    // 파일 쓰기
    let logName = "/usr/service/wjsyncweb/data/sync_full_chk_data_" + dateParam + ".log";
    // let logName = "../data/sync_full_chk_data_" + dateParam + ".log";
    fs.writeFileSync(logName, arrData.toString().replace(/,/g,"\n"));

    res.status(200).send("OK");
}

router.get("/:dateParam", fncData);

module.exports = router;