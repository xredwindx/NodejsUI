const express = require("express");
const path = require("path");

const router =  express.Router();

function fncFileDownload(req, res) {
    let fileName = req.params.id;
    let filePath = path.join(__dirname, fileName);
    res.download(filePath);
}

router.get("/:id", fncFileDownload);

module.exports = router;