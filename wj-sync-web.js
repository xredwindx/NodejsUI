const cluster = require('cluster');
const express = require('express');
const bodyParser = require('body-parser');
const syncDataHandle = require('./routes/sync-data-handle');
const syncView = require('./routes/sync-view');
const syncView20171026 = require('./routes/sync-view-20171026');
const syncViewOld = require('./routes/sync-view-old');
const syncViewBefore = require('./routes/sync-view-before');
const syncBefore = require('./routes/sync-before');
// const accesslogView = require('./routes/accesslog-view');
const hlsView = require('./routes/hls-view');
const fileDw = require('./files/file-download');
const mp = require('./routes/main-view');

const app = express();
let port = 8888;
const numCPUS = require('os').cpus().length;

if(cluster.isMaster) {
    for(let i=0 ; i < numCPUS ; i++) {
        cluster.fork();
    }
    cluster.on("exit", function (worker, code, signal) {
        console.log("worker "+worker.process.pid+" died");
    })
} else {

    // ejs
    app.engine("html", require("ejs").renderFile);
    app.set("view engine", "ejs");

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use("/sync/data", syncDataHandle);
    app.use("/view", syncView);
    app.use("/view20171026", syncView20171026);
    app.use("/viewBefore", syncViewBefore);
    app.use("/viewOld", syncViewOld);
    app.use("/before", syncBefore);
    app.use("/download", fileDw);
    app.use("/hls", hlsView);
    app.use("/public", express.static(__dirname + "/public"));
    app.use("/", mp);
    // app.use("/accesslog", accesslogView);

    // start server
    app.listen(port);
    console.info("##################################");
    console.log("# node js server start port:" + port + "#");
    console.info("##################################");

}