import { injectable } from "tsyringe";
import { Action } from "../schemas/Action";

@injectable()
class GetActionByGameRoomService {

  async execute(roomId: string) {
    const actions = await Action.find({
      roomId
    }).populate("to").exec();

    return actions;
  }
}

export { GetActionByGameRoomService };