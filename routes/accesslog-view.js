const express = require("express");
const router = express.Router()

function fncAccessMain(req, res) {
    res.render("accesslog", {});
}

function fncAccessData(req, res) {
    let arrData = [];
    res.send({"arrData":arrData});
}

router.get("/", fncAccessMain);
router.get("/list", fncAccessData);

module.exports = router;