const express = require("express");
const fs = require("fs");
const router = express.Router();

function fncAccessMain(req, res) {
    res.render("accesslog", {});
}

function fncAccessData(req, res) {
    let dateParam = req.query.dateParam;
    let hourParam = req.query.hourParam;
    console.log(req.query);
    let fileName1 = "2017101919-SK-81-FHS5174.log";
    let fileName = "acesss_" + dateParam + hourParam + ".log";
    console.log(fileName);
    let fileData = fs.readFileSync("../access/" + fileName1, "utf-8").split("\n");
    let arrData = [];

    fileData.forEach(function (item) {
        arrData.push({"data": item});
    });
    res.send({"arrData":arrData});
}

router.get("/", fncAccessMain);
router.get("/list", fncAccessData);

module.exports = router;