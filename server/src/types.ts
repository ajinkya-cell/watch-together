export type ClientMessage =
  | { type: "JOIN"; roomId: string }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "SEEK"; time: number }
  | { type: "SET_VIDEO"; videoId: string };

export type ServerMessage =
  | { type: "STATE"; videoId: string; time: number; isPlaying: boolean }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "SEEK"; time: number }
  | { type: "SET_VIDEO"; videoId: string };
