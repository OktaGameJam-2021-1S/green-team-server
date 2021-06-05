"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var http_1 = require("./http");
require("./websocket/GameService");
http_1.server.listen(process.env.PORT || process.env.PORT_LOCAL, function () { return console.log("Running!"); });
