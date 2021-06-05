import { injectable } from "tsyringe";
import { GameRoom } from "../schemas/GameRoom";

@injectable()
class GetGameRoomByIdService {
  
  async execute(idGameRoom: string) {
    const room = await GameRoom.findOne({
      idGameRoom,
    }).populate("idUsers").exec();

    return room;
  }
}

export { GetGameRoomByIdService };