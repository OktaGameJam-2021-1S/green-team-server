import { ObjectId } from "mongoose";
import { injectable } from "tsyringe";
import { GameRoom } from "../schemas/GameRoom";

@injectable()
class GetGameRoomByUserService {

  async execute(idUsers: Array<ObjectId>) {
    const room = await GameRoom.findOne({
      idUsers: {
        $all: idUsers
      }
    }).exec()

    return room;
  }
}

export { GetGameRoomByUserService };