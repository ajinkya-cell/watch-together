"use client";

import { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { createSocket } from "../../lib/socket";
import { ServerMessage } from "../../types";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const playerRef = useRef<any>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // WebSocket setup
  useEffect(() => {
    if (!id) return;

    socketRef.current = createSocket(id);

    socketRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data) as ServerMessage;
      const player = playerRef.current;
      if (!player) return;

      switch (msg.type) {
        case "PLAY":
          player.playVideo();
          break;
        case "PAUSE":
          player.pauseVideo();
          break;
        case "SEEK":
          player.seekTo(msg.time, true);
          break;
        case "SET_VIDEO":
          player.loadVideoById(msg.videoId);
          break;
        case "STATE":
          player.loadVideoById(msg.videoId);
          player.seekTo(msg.time, true);
          msg.isPlaying ? player.playVideo() : player.pauseVideo();
          break;
      }
    };

    return () => {
      socketRef.current?.close();
    };
  }, [id]);

  // Load YouTube API
  useEffect(() => {
    if (window.YT) return;

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player("player", {
        height: "390",
        width: "640",
        videoId: "dQw4w9WgXcQ",
        events: {
          onStateChange: (e: any) => {
            if (!socketRef.current) return;

            if (e.data === window.YT.PlayerState.PLAYING) {
              socketRef.current.send(JSON.stringify({ type: "PLAY" }));
            }

            if (e.data === window.YT.PlayerState.PAUSED) {
              socketRef.current.send(JSON.stringify({ type: "PAUSE" }));
            }
          },
        },
      });
    };
  }, []);

  return (
    <div className="flex justify-center mt-10">
      <div id="player" />
    </div>
  );
}
