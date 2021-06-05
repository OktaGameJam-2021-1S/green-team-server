import mongoose, { Document, Schema } from 'mongoose';

type User = Document & {
  device_id: string;
  socket_id: string;
}

const UserSchema = new Schema({
  device_id: String,
  socket_id: String,
});

const User = mongoose.model<User>("Users", UserSchema);

export { User };