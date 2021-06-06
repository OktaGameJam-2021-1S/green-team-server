"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamePlayer = exports.GameRoom = void 0;
var getId = (function () {
    var id = 0;
    return function () {
        return id++;
    };
})();
var GamePlayer = /** @class */ (function () {
    function GamePlayer(socket) {
        var _this = this;
        this.id = getId();
        this.x = 1;
        this.y = 0;
        this.hasTool = false;
        this.toolId = 0;
        this.moveSpeed = 3;
        this.speed = 0;
        this.horizontalInput = 0;
        this.socket = socket;
        this.socket.on('disconnect', function () {
            _this.gameRoom.removePlayer(_this);
        });
        this.socket.emit("player_connect", this.networkData());
        this.socket.on('start_game', function (inputStr) {
            console.log('start_game');
            _this.gameRoom.startGame();
        });
        this.socket.on('player_input', function (inputStr) {
            console.log('player_input', inputStr);
            var input = JSON.parse(inputStr);
            if (input) {
                _this.horizontalInput = input.horizontal;
                _this.y += input.vertical;
            }
        });
        this.socket.on('player_damage_building', function (inputStr) {
            console.log('player_damage_building', inputStr);
            var input = JSON.parse(inputStr);
            if (input) {
                var building = _this.gameRoom.gameState.buildings.find(function (x) { return x.id == input.id; });
                building.damage += 1;
            }
        });
        this.socket.on('player_seed_building', function (inputStr) {
            console.log('player_seed_building', inputStr);
            var input = JSON.parse(inputStr);
            if (input) {
                var building = _this.gameRoom.gameState.buildings.find(function (x) { return x.id == input.id; });
                building.plant += 1;
            }
        });
        this.socket.on('player_pick_up_tool', function (inputStr) {
            console.log('player_pick_up_tool', inputStr);
            var input = JSON.parse(inputStr);
            if (input) {
                _this.hasTool = true;
                _this.toolId = input.id;
                var tool = _this.gameRoom.gameState.tools.find(function (x) { return x.id == input.id; });
                tool.isHold = true;
            }
        });
        this.socket.on('player_drop_tool', function (inputStr) {
            _this.hasTool = false;
            var tool = _this.gameRoom.gameState.tools.find(function (x) { return x.id == _this.toolId; });
            if (tool) {
                tool.x = _this.x;
                tool.y = _this.y;
                tool.isHold = false;
            }
        });
    }
    GamePlayer.prototype.setGameRoom = function (gameRoom) {
        this.gameRoom = gameRoom;
    };
    GamePlayer.prototype.update = function (deltaTime) {
        this.speed = this.horizontalInput * this.moveSpeed;
        this.x += this.speed * deltaTime;
    };
    GamePlayer.prototype.networkData = function () {
        return {
            id: this.id,
            x: this.x,
            moveSpeed: this.moveSpeed,
            speed: this.speed,
            y: this.y,
            hasTool: this.hasTool,
            toolId: this.toolId,
        };
    };
    return GamePlayer;
}());
exports.GamePlayer = GamePlayer;
var GameRoom = /** @class */ (function () {
    function GameRoom() {
        this.socket = null;
        this.players = [];
        this.gameState = {
            players: [],
            buildings: [],
            tools: [],
        };
        this.gameIsRunning = false;
        this.gameLoop = this.gameLoop.bind(this);
        this.previousTick = Date.now();
    }
    GameRoom.prototype.setSocket = function (socket) {
        this.socket = socket;
    };
    GameRoom.prototype.addPlayer = function (player) {
        console.log("Player added: " + player.id);
        this.players.push(player);
        player.setGameRoom(this);
        return player;
    };
    GameRoom.prototype.removePlayer = function (player) {
        this.players = this.players.filter(function (x) { return x.id != player.id; });
        if (this.players.length == 0 && this.gameIsRunning) {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
            this.gameIsRunning = false;
        }
    };
    GameRoom.prototype.startGame = function () {
        var _this = this;
        if (this.gameIsRunning)
            return;
        this.gameIsRunning = true;
        this.socket.emit('game_pre_start');
        setTimeout(function () {
            _this.socket.emit('game_start');
            var x = 0;
            for (var index = 0; index < 10; index++) {
                var width = Math.round(Math.random() * 2) + 1;
                _this.gameState.buildings.push({
                    id: index,
                    x: x,
                    width: width,
                    height: Math.round(Math.random() * 2) + 1,
                    color: "#ffcc00",
                    damage: 0,
                    plant: 0,
                    graffiti: false,
                });
                x += width;
            }
            _this.gameState.tools = [
                {
                    id: 0,
                    x: 2,
                    y: 0,
                    type: 0,
                    uses: 2,
                    isHold: false
                }, {
                    id: 1,
                    x: 4,
                    y: 1,
                    type: 2,
                    uses: 2,
                    isHold: false
                }
            ];
            _this.gameLoopInterval = setInterval(_this.gameLoop, 10);
        }, 2000);
    };
    GameRoom.prototype.gameLoop = function () {
        var now = Date.now();
        var delta = (now - this.previousTick) / 1000;
        this.previousTick = now;
        this.gameState.players = [];
        for (var index = 0; index < this.players.length; index++) {
            var element = this.players[index];
            element.update(delta);
            this.gameState.players.push(element.networkData());
        }
        // this.gameState.players = this.players.map(x => x.networkData());
        // this.socket.emit('game_state', this.gameState);
        for (var index = 0; index < this.players.length; index++) {
            this.players[index].socket.emit('game_state', this.gameState);
        }
    };
    return GameRoom;
}());
exports.GameRoom = GameRoom;
