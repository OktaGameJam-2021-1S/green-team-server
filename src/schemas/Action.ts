import mongoose, { Document, Schema } from 'mongoose';

type Action = Document & {
  to: string;
  text: string;
  created_at: Date;
  roomId: string;
}

const ActionSchema = new Schema({
  to: {
    type: Schema.Types.ObjectId,
    ref: "Users"
  },
  text: String,
  created_at: {
    type: Date,
    default: Date.now()
  },
  roomId: {
    type: String,
    ref: "GameRoom"
  },
});

const Action = mongoose.model<Action>("Actions", ActionSchema);

export { Action };