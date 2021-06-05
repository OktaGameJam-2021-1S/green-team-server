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

io.on("connect", socket => {
  socket.on('ping', () => {
    socket.emit("pong", "pong")

    console.log('ping');
  });

  socket.on("create_user", async (data) => {
    const { device_id } = data;
    
    const createUserService = container.resolve(CreateUserService);
    
    await createUserService.execute({
      device_id,
      socket_id: socket.id,
    });
  });

  socket.on("create_room", async () => {
    const createGameRoomService = container.resolve(CreateGameRoomService);
    const getUserBySocketIdService = container.resolve(GetUserBySocketIdService);
    const getGameRoomByUserService = container.resolve(GetGameRoomByUserService);
    
    const user = await getUserBySocketIdService.execute(socket.id);
    
    let room = await getGameRoomByUserService.execute([user._id])
    
    if (!room) {
      room = await createGameRoomService.execute([user._id]);
    }
    
    socket.join(room.idGameRoom);

    socket.broadcast.emit("new_game", user);
  });

  socket.on("enter_room", async (data) => {
    const getUserBySocketIdService = container.resolve(GetUserBySocketIdService);
    const getGameRoomByUserService = container.resolve(GetGameRoomByUserService);

    const user = await getUserBySocketIdService.execute(socket.id);

    let room = await getGameRoomByUserService.execute([data.idUser])

    if(!room.idUsers.some(idUser => {
      console.log(idUser);
      
      return String(idUser) === String(user._id)
    
    })) {
      room.idUsers.push(user._id)
      room.save()
    }
    
    socket.join(room.idGameRoom);

    socket.broadcast.emit("new_user_room", user);
  });
});