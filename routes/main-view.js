const express = require("express");
const router =  express.Router();

function fncMain(req, res) {
    res.render("main", {});
}

router.get("/", fncMain);

module.exports = router;