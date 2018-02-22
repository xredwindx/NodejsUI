const express = require('express');
const bodyParser = require('body-parser');
const syncDataHandle = require('./routes/sync-data-handle');
const syncView = require('./routes/sync-view');
const syncBefore = require('./routes/sync-before');
//const syncView20171026 = require('./routes/sync-view-20171026');
//const syncViewOld = require('./routes/sync-view-old');
//const syncViewBefore = require('./routes/sync-view-before');
// const accesslogView = require('./routes/accesslog-view');
const hlsView = require('./routes/hls-view');
const fileDw = require('./files/file-download');
const mp = require('./routes/main-view');
const failChk = require('./routes/fail-chk');

const app = express();
let port = 8888;

// ejs
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use("/sync/data", syncDataHandle);
app.use("/view", syncView);
app.use("/before", syncBefore);
// app.use("/view20171026", syncView20171026);
// app.use("/viewBefore", syncViewBefore);
// app.use("/viewOld", syncViewOld);
// app.use("/accesslog", accesslogView);
app.use("/download", fileDw);
app.use("/hls", hlsView);
app.use("/public", express.static(__dirname + "/public"));
app.use("/", mp);
app.use("/chk_fail", failChk);

// dims purge
// const fileUpload = require("./routes/file-upload-web.js");
// app.set("view engine", "jade");
// app.use("/web/file", fileUplaod);
// app.use("/web/imgq_ip_list", express.static(config.dims_ip_file));

// start server
app.listen(port);
console.info("##################################");
console.log("# node js server start port:" + port + "#");
console.info("##################################");