import { io } from "socket.io-client";

const socket = io(`${import.meta.env.VITE_BACKEND_URL}/`, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000
});

export const checkRoom = (roomId) => {
  return new Promise((resolve) => {
    socket.emit("check-room", { roomId });
    socket.once("room-status", (status) => {
      resolve(status);
    });
  });
};

export const joinRoom = (roomId, username, password = "") => {
  socket.emit("join-room", { roomId, username, password });
};

export const leaveRoom = (roomId) => {
  socket.emit("leave-room", { roomId });
};

export const sendContentChange = (roomId, content) => {
  socket.emit("content-change", { roomId, content });
};

export default socket;
