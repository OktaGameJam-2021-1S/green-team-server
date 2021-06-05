import "reflect-metadata";
import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';

const app = express();

const server = createServer(app);

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

app.use(express.static(path.join(__dirname, "..", "public")))

const io = new Server(server);

io.attach(server, {
  cors: {
    origin: '*'
  }
});

io.on("connection", () => {
})

app.get('/', (req, res) => {
  return res.json({message: "hello"})
});

export { server, io };