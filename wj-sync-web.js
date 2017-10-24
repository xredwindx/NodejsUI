const express = require('express');
const bodyParser = require('body-parser');
const syncView = require('./routes/sync-view');
const syncViewOld = require('./routes/sync-view-old');
// const accesslogView = require('./routes/accesslog-view');
const hlsView = require('./routes/hls-view');
const fileDw = require('./files/file-download');
const mp = require('./routes/main-view');

const app = express();
let port = 8888;

// ejs
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use("/view", syncView);
app.use("/viewOld", syncViewOld);
app.use("/download", fileDw);
app.use("/hls", hlsView);
app.use("/public", express.static(__dirname+"/public"));
app.use("/", mp);
// app.use("/accesslog", accesslogView);

// start server
app.listen(port);
console.info("##################################");
console.log("# node js server start port:"+port +"#");
console.info("##################################");
