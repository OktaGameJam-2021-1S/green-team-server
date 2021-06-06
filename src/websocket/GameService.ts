import { container } from 'tsyringe';
import { io } from '../http';

import { CreateGameRoomService } from '../services/CreateGameRoomService';
import { CreateActionService } from '../services/CreateActionService';

import { CreateUserService } from '../services/CreateUserService';
import { GetAllUserService } from '../services/GetAllUserService';
import { GetGameRoomByIdService } from '../services/GetGameRoomByIdService';
import { GetGameRoomByUserService } from '../services/GetGameRoomByUserService';
import { GetActionByGameRoomService } from '../services/GetActionByGameRoomService';
import { GetUserBySocketIdService } from '../services/GetUserBySocketIdService';
import { GamePlayer, GameRoom } from './GameRoom';

let rooms = {}
let id = 0
io.on("connect", socket => {

  let player = new GamePlayer(socket)
  console.log(`NEW PLAYER | ${player.id}`);
  
  // socket.on("create_user", async (data) => {
  //   const { device_id } = JSON.parse(data);

  //   const createUserService = container.resolve(CreateUserService);
    
  //   await createUserService.execute({
  //     device_id,
  //     socket_id: socket.id,
  //   });
  // });

  socket.on("create_room", async (data) => {
    const parsedData = JSON.parse(data)
    // const createGameRoomService = container.resolve(CreateGameRoomService);
    // const getUserBySocketIdService = container.resolve(GetUserBySocketIdService);
    // const getGameRoomByUserService = container.resolve(GetGameRoomByUserService);
    
    // const user = await getUserBySocketIdService.execute(socket.id);
    
    // let room = await getGameRoomByUserService.execute([user._id])
    
    // if (!room) {
    //   room = await createGameRoomService.execute([user._id]);
    // }
    
    let roomName: string = parsedData.roomName;
    socket.join(roomName);

    console.log("Room created: " + roomName);

    const gameRoom = new GameRoom();
    gameRoom.addPlayer(player);
    gameRoom.setSocket(io);
    rooms[roomName] = gameRoom;

    socket.broadcast.emit("new_room", roomName);
  });

  socket.on("enter_room", async (data) => {
    const parsedData = JSON.parse(data)
    // const getUserBySocketIdService = container.resolve(GetUserBySocketIdService);
    // const getGameRoomByUserService = container.resolve(GetGameRoomByUserService);

    // const user = await getUserBySocketIdService.execute(socket.id);

    // let room = await getGameRoomByUserService.execute([parsedData.idUser])

    // if(!room.idUsers.some(idUser => {
    //   console.log(idUser);
      
    //   return String(idUser) === String(user._id)
    
    // })) {
    //   room.idUsers.push(user._id)
    //   room.save()
    // }
    
    let roomName: string = parsedData.roomName
    socket.join(roomName);
    const gameRoom = rooms[roomName];
    gameRoom.addPlayer(player);

    socket.broadcast.emit("new_user_room", roomName);
  });

});