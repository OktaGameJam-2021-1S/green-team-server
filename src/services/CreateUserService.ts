import { injectable } from "tsyringe";
import { User } from "../schemas/User";

interface CreateUserDTO {
  device_id: string;
  socket_id: string;
}

@injectable()
class CreateUserService {

  async execute({ device_id, socket_id }: CreateUserDTO) {
    const userAlreadyExists = await User.findOne({
      device_id
    }).exec();

    if (userAlreadyExists) {
      const user = await User.findOneAndUpdate({
        _id: userAlreadyExists._id
      },
      {
        $set: { socket_id, device_id }
      },
      {
        new: true
      });

      return user;
    } else {{
      const user = await User.create({
        socket_id,
        device_id
      })

      return user;
    }}
  }
}

export { CreateUserService };