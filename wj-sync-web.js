const express = require('express');
const bodyParser = require('body-parser');
const syncView = require('./routes/sync-view');
const fileDw = require('./files/file-download');

const app = express();
let port = 8888;

// ejs
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use("/view", syncView);
app.use("/download", fileDw);

// start server
app.listen(port);
console.log("node js server start port:"+port);
