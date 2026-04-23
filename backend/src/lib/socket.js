import { Server } from "socket.io"
import http from "http";

import express from "express"

const app = express();
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin:["http://localhost:5173"]
    }
})

export function getRecevierSocketId(userId) {
    return socketMap[userId]
}
//  to store online users
const socketMap = {
};

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) socketMap[userId] = socket.id
    // this function is used to send events to the connected clients
    io.emit("getOnlineUsers", Object.keys(socketMap))

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        delete socketMap[userId];
        io.emit("getOnlineUsers", Object.keys(socketMap))
    });
});

export { io, app, server };
