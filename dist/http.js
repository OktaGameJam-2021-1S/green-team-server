"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = void 0;
require("reflect-metadata");
var express_1 = __importDefault(require("express"));
var path_1 = __importDefault(require("path"));
var http_1 = require("http");
var socket_io_1 = require("socket.io");
var mongoose_1 = __importDefault(require("mongoose"));
var app = express_1.default();
var server = http_1.createServer(app);
exports.server = server;
mongoose_1.default.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public")));
var io = new socket_io_1.Server(server);
exports.io = io;
io.attach(server, {
    cors: {
        origin: '*'
    }
});
io.on("connection", function () {
});
app.get('/', function (req, res) {
    return res.json({ message: "hello" });
});
