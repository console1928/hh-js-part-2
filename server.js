const config = require("./config");
const express = require("express");
const app = express();

app.use("/", express.static("./src"));

app.listen(config.port);
