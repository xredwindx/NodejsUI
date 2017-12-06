const express = require("express");
const multer = require("multer");
const config = require("../comm/config.json");
// const config = require("../comm/dev_config.json");

const router =  express.Router();

let storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, config.dims_ip_file_dir);
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
const upload = multer({storage:storage, limits: {fileSize: 1024 * 1024}});

function fileView(req, res) {
    res.render("import", {});
}

function fileImport(req, res) {
    res.status(200).send("OK");
}

router.get("/", fileView);
router.post("/import", upload.single("file"), fileImport);

module.exports = router;