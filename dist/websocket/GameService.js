"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var tsyringe_1 = require("tsyringe");
var http_1 = require("../http");
var CreateGameRoomService_1 = require("../services/CreateGameRoomService");
var CreateUserService_1 = require("../services/CreateUserService");
var GetGameRoomByUserService_1 = require("../services/GetGameRoomByUserService");
var GetUserBySocketIdService_1 = require("../services/GetUserBySocketIdService");
http_1.io.on("connect", function (socket) {
    socket.on('ping', function () {
        socket.emit("pong", "pong");
        console.log('ping');
    });
    socket.on("create_user", function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var device_id, createUserService;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    device_id = data.device_id;
                    createUserService = tsyringe_1.container.resolve(CreateUserService_1.CreateUserService);
                    return [4 /*yield*/, createUserService.execute({
                            device_id: device_id,
                            socket_id: socket.id,
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    socket.on("create_room", function () { return __awaiter(void 0, void 0, void 0, function () {
        var createGameRoomService, getUserBySocketIdService, getGameRoomByUserService, user, room;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    createGameRoomService = tsyringe_1.container.resolve(CreateGameRoomService_1.CreateGameRoomService);
                    getUserBySocketIdService = tsyringe_1.container.resolve(GetUserBySocketIdService_1.GetUserBySocketIdService);
                    getGameRoomByUserService = tsyringe_1.container.resolve(GetGameRoomByUserService_1.GetGameRoomByUserService);
                    return [4 /*yield*/, getUserBySocketIdService.execute(socket.id)];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, getGameRoomByUserService.execute([user._id])];
                case 2:
                    room = _a.sent();
                    if (!!room) return [3 /*break*/, 4];
                    return [4 /*yield*/, createGameRoomService.execute([user._id])];
                case 3:
                    room = _a.sent();
                    _a.label = 4;
                case 4:
                    socket.join(room.idGameRoom);
                    socket.broadcast.emit("new_game", user);
                    return [2 /*return*/];
            }
        });
    }); });
    socket.on("enter_room", function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var getUserBySocketIdService, getGameRoomByUserService, user, room;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    getUserBySocketIdService = tsyringe_1.container.resolve(GetUserBySocketIdService_1.GetUserBySocketIdService);
                    getGameRoomByUserService = tsyringe_1.container.resolve(GetGameRoomByUserService_1.GetGameRoomByUserService);
                    return [4 /*yield*/, getUserBySocketIdService.execute(socket.id)];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, getGameRoomByUserService.execute([data.idUser])];
                case 2:
                    room = _a.sent();
                    if (!room.idUsers.some(function (idUser) {
                        console.log(idUser);
                        return String(idUser) === String(user._id);
                    })) {
                        room.idUsers.push(user._id);
                        room.save();
                    }
                    socket.join(room.idGameRoom);
                    socket.broadcast.emit("new_user_room", user);
                    return [2 /*return*/];
            }
        });
    }); });
});
