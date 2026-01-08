import { ClientMessage } from "../types";

export function createSocket(roomId: string) {
  const socket = new WebSocket("ws://localhost:4000");

  socket.addEventListener("open", () => {
    const joinMsg: ClientMessage = {
      type: "JOIN",
      roomId,
    };
    socket.send(JSON.stringify(joinMsg));
  });

  return socket;
}
