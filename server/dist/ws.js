import WebSocket, { WebSocketServer } from "ws";
const rooms = new Map();
export function initWebSocket(server) {
    const wss = new WebSocketServer({ server });
    wss.on("connection", (ws) => {
        let currentRoom = null;
        ws.on("message", (data) => {
            const msg = JSON.parse(data.toString());
            if (msg.type === "JOIN") {
                currentRoom = msg.roomId;
                if (!rooms.has(currentRoom)) {
                    rooms.set(currentRoom, {
                        videoId: "dQw4w9WgXcQ",
                        time: 0,
                        isPlaying: false,
                        clients: new Set(),
                    });
                }
                const room = rooms.get(currentRoom);
                room.clients.add(ws);
                const state = {
                    type: "STATE",
                    videoId: room.videoId,
                    time: room.time,
                    isPlaying: room.isPlaying,
                };
                ws.send(JSON.stringify(state));
                return;
            }
            if (!currentRoom)
                return;
            const room = rooms.get(currentRoom);
            switch (msg.type) {
                case "PLAY":
                    room.isPlaying = true;
                    broadcast(room, { type: "PLAY" });
                    break;
                case "PAUSE":
                    room.isPlaying = false;
                    broadcast(room, { type: "PAUSE" });
                    break;
                case "SEEK":
                    room.time = msg.time;
                    broadcast(room, { type: "SEEK", time: msg.time });
                    break;
                case "SET_VIDEO":
                    room.videoId = msg.videoId;
                    room.time = 0;
                    broadcast(room, { type: "SET_VIDEO", videoId: msg.videoId });
                    break;
            }
        });
        ws.on("close", () => {
            if (!currentRoom)
                return;
            rooms.get(currentRoom)?.clients.delete(ws);
        });
    });
}
function broadcast(room, msg) {
    room.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msg));
        }
    });
}
