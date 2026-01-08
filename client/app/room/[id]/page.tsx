"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { createSocket } from "../../lib/socket";
import { ServerMessage } from "../../types";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

/* ------------------ helpers ------------------ */

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1);
    }

    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v");
    }

    const match = parsed.pathname.match(/\/embed\/([^/?]+)/);
    if (match) return match[1];

    return null;
  } catch {
    return null;
  }
}

/* ------------------ component ------------------ */

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();

  const playerRef = useRef<any>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const isRemoteActionRef = useRef(false);

  const [videoUrl, setVideoUrl] = useState("");

  /* ------------------ websocket ------------------ */

  useEffect(() => {
    if (!id) return;

    socketRef.current = createSocket(id);

    socketRef.current.onmessage = (event) => {
      const msg = JSON.parse(event.data) as ServerMessage;
      const player = playerRef.current;
      if (!player) return;

      isRemoteActionRef.current = true;

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

      // release guard after this tick
      setTimeout(() => {
        isRemoteActionRef.current = false;
      }, 0);
    };

    return () => {
      socketRef.current?.close();
    };
  }, [id]);

  /* ------------------ youtube api ------------------ */

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
        playerVars: {
          autoplay: 0,
          controls: 1,
        },
        events: {
          onStateChange: (e: any) => {
            if (!socketRef.current) return;
            if (isRemoteActionRef.current) return;

            if (e.data === window.YT.PlayerState.PLAYING) {
              socketRef.current.send(
                JSON.stringify({ type: "PLAY" })
              );
            }

            if (e.data === window.YT.PlayerState.PAUSED) {
              socketRef.current.send(
                JSON.stringify({ type: "PAUSE" })
              );
            }
          },
        },
      });
    };
  }, []);

  /* ------------------ handlers ------------------ */

  const handleSetVideo = () => {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId || !playerRef.current || !socketRef.current) return;

    // local update
    playerRef.current.loadVideoById(videoId);

    // remote sync
    socketRef.current.send(
      JSON.stringify({ type: "SET_VIDEO", videoId })
    );

    setVideoUrl("");
  };

  /* ------------------ ui ------------------ */

  return (
    <div className="flex flex-col items-center mt-10 gap-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Paste YouTube link"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="border px-3 py-2 rounded w-80"
        />
        <button
          onClick={handleSetVideo}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Load
        </button>
      </div>

      <div id="player" />
    </div>
  );
}
