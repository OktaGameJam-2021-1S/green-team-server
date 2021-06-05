import { injectable } from "tsyringe";
import { Action } from "../schemas/Action";

interface CreateMessageDTO {
  to: string;
  text: string;
  roomId: string;
}

@injectable()
class CreateActionService {
  
  async execute({ roomId, text, to }: CreateMessageDTO) {
    const action = await Action.create({
      to,
      text,
      roomId
    });

    return action;

  }
}

export { CreateActionService };