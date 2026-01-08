import express from "express";
import http from "http";
import { initWebSocket } from "./ws.js";

const app = express();
const server = http.createServer(app);

initWebSocket(server);

app.get("/", (_, res) => {
  res.send("Watch Together Backend");
});

server.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
