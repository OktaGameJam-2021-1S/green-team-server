import { injectable } from "tsyringe";
import { GameRoom } from "../schemas/GameRoom";

@injectable()
class CreateGameRoomService {
  
  async execute(idUsers: Array<string>) {
    const room = await GameRoom.create({
      idUsers,
    });

    return room;

  }
}

export { CreateGameRoomService };