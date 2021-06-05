import mongoose, { Document, Schema } from 'mongoose';
import { User } from './User';
import { v4 as uuid } from 'uuid';

type GameRoom = Document & {
  idUsers: User[];
  idGameRoom: string;
}

const GameRoomSchema = new Schema({
  idUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: "Users"
    }
  ],
  idGameRoom: {
    type: String,
    default: uuid
  }
});

const GameRoom = mongoose.model<GameRoom>("GameRoom", GameRoomSchema);

export { GameRoom };