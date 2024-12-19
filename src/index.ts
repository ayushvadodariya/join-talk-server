import { IncomingMessage} from 'http'
import { WebSocketServer, WebSocket, RawData } from "ws";

interface customHeaders extends IncomingMessage{
  headers: {
    roomid?: string;
    username?: string;
  }
}

const wss = new WebSocketServer({ port: 8080 });

type roomMap= Record<string, WebSocket[]>;
const rooms: roomMap = {};


wss.on("connection", function (ws: WebSocket, req : customHeaders){
  const roomId= req.headers['roomid'];
  console.log(`roomId is ${roomId}`);
  const username= req.headers['username'];
  if(!roomId) {
    ws.send("join with valid roomId");
    return;
  };
  if(!rooms[roomId]){
    rooms[roomId] = []; 
  }

  rooms[roomId].push(ws);

  ws.on("message", (data)=>{
    const message = data.toString();
    const memberList = rooms[roomId];
    console.log(`member list is ${memberList}`);
    memberList.forEach((memberSocket)=>{
      if(memberSocket !== ws){
      memberSocket.send(`username:${username ?? "unknown"}, message: ${message}`);
      }
    });
  });

  ws.on("close", ()=>{
    rooms[roomId] = rooms[roomId].filter((member)=> member!==ws );
    console.log(`Client disconnected from room ${roomId} , ${username}`);
  });

});


