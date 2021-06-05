import 'dotenv/config';
import { server } from './http';
import "./websocket/GameService";

server.listen(process.env.PORT || process.env.PORT_LOCAL, () => console.log("Running!"));