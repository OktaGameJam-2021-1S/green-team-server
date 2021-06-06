interface Player
{
    id: number;
    x: number;
    y: number;

    speed: number;
    moveSpeed: number;

    hasTool: boolean;
    toolId: number;
}

interface Building
{
    id: number;

    width: number;
    height: number;
    x: number;
    
    color: string;

    damage: number;
    plant: number;
    graffiti: boolean;
}

interface Tool
{
    id: number;
    x: number;
    y: number;
    
    type: number;
    uses: number;
    isHold: boolean;
}

interface GameState {
    players: Array<Player>;
    buildings: Array<Building>;
    tools: Array<Tool>;
}

const getId = (function() {
    let id = 0
    return function() {
        return id++
    }
})()

class GamePlayer {

    id: number;
    socket: any;

    x: number;
    y: number;
    hasTool: boolean;
    toolId: number;
    speed: number;
    moveSpeed: number;

    horizontalInput: number;

    gameRoom: GameRoom;

    constructor(socket) {
        this.id = getId()

        this.x = 1
        this.y = 0
        this.hasTool = false
        this.toolId = 0

        this.moveSpeed = 3
        this.speed = 0

        this.horizontalInput = 0

        this.socket = socket

        this.socket.on('disconnect', () => {
            this.gameRoom.removePlayer(this);
        });

        this.socket.emit("player_connect", this.networkData());
        
        this.socket.on('start_game', (inputStr) => {
            console.log('start_game')
            this.gameRoom.startGame()
        });
        
        this.socket.on('player_input', (inputStr) => {
            console.log('player_input', inputStr)
            
            let input = JSON.parse(inputStr)
            if (input) {
                this.horizontalInput = input.horizontal
                this.y += input.vertical
            }
        });
        this.socket.on('player_damage_building', (inputStr) => {
            console.log('player_damage_building', inputStr)
            
            let input = JSON.parse(inputStr)
            if (input) {
                const building = this.gameRoom.gameState.buildings.find(x => x.id == input.id)
                building.damage += 1
            }
        });
        this.socket.on('player_seed_building', (inputStr) => {
            console.log('player_seed_building', inputStr)
            
            let input = JSON.parse(inputStr)
            if (input) {
                const building = this.gameRoom.gameState.buildings.find(x => x.id == input.id)
                building.plant += 1
            }
        });
        this.socket.on('player_pick_up_tool', (inputStr) => {
            console.log('player_pick_up_tool', inputStr)
            
            let input = JSON.parse(inputStr)
            if (input) {
                this.hasTool = true
                this.toolId = input.id
                const tool = this.gameRoom.gameState.tools.find(x => x.id == input.id)
                tool.isHold = true
            }
        });
        this.socket.on('player_drop_tool', (inputStr) => {
            this.hasTool = false
            const tool = this.gameRoom.gameState.tools.find(x => x.id == this.toolId)
            if (tool)
            {
                tool.x = this.x
                tool.y = this.y
                tool.isHold = false
            }
        });
    }

    public setGameRoom(gameRoom) {
        this.gameRoom = gameRoom
    }

    public update(deltaTime) {
        this.speed = this.horizontalInput * this.moveSpeed;
        this.x += this.speed * deltaTime
    }

    public networkData(): Player {
        return {
            id: this.id,
            x: this.x,
            moveSpeed: this.moveSpeed,
            speed: this.speed,
            y: this.y,
            hasTool: this.hasTool,
            toolId: this.toolId,
        }
    }

}

class GameRoom {

    gameState: GameState;
    socket: any;
    previousTick: number;

    gameIsRunning: boolean;
    gameLoopInterval: NodeJS.Timeout;

    players: Array<GamePlayer>;

    constructor() {
        this.socket = null
        this.players = []
        this.gameState = {
            players: [],
            buildings: [],
            tools: [],
        }

        this.gameIsRunning = false;

        this.gameLoop = this.gameLoop.bind(this)
        this.previousTick = Date.now()
    }

    public setSocket(socket) {
        this.socket = socket
    }

    public addPlayer(player: GamePlayer) {
        console.log("Player added: " + player.id);
        
        this.players.push(player);
        player.setGameRoom(this);
        return player;
    }

    public removePlayer(player: GamePlayer) {
        this.players = this.players.filter(x => x.id != player.id);
        if (this.players.length == 0 && this.gameIsRunning)
        {
            clearInterval(this.gameLoopInterval);
            this.gameLoopInterval = null;
            this.gameIsRunning = false
        }
    }

    public startGame() {

        if (this.gameIsRunning) return;

        this.gameIsRunning = true;

        this.socket.emit('game_pre_start')
        setTimeout(() => {

            this.socket.emit('game_start')
            let x = 0
            for (let index = 0; index < 10; index++) {
                let width = Math.round(Math.random() * 2) + 1
                this.gameState.buildings.push({
                    id: index,
                    x,
                    width,
                    height: Math.round(Math.random() * 2) + 1,
                    color: "#ffcc00",
                    damage: 0,
                    plant: 0,
                    graffiti: false,
                });
                x += width
            }
    
            this.gameState.tools = [
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
    
            this.gameLoopInterval = setInterval(this.gameLoop, 10);

        }, 2000)

    }

    gameLoop() {
        let now = Date.now()
        const delta = (now - this.previousTick) / 1000
        this.previousTick = now

        this.gameState.players = []
        for (let index = 0; index < this.players.length; index++) {
            const element = this.players[index];
            element.update(delta)
            this.gameState.players.push(element.networkData())
        }

        // this.gameState.players = this.players.map(x => x.networkData());
        // this.socket.emit('game_state', this.gameState);
        for (let index = 0; index < this.players.length; index++) {
            this.players[index].socket.emit('game_state', this.gameState);
        }
    }
}

export { GameRoom, GamePlayer };
