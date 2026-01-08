"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

function generateRoomId() {
  return Math.random().toString(36).substring(2, 10);
}

export default function HomePage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");

  const createRoom = () => {
    const id = generateRoomId();
    router.push(`/room/${id}`);
  };

  const joinRoom = () => {
    if (!roomId.trim()) return;
    router.push(`/room/${roomId.trim()}`);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2">
          Watch Together ❤️
        </h1>

        <p className="text-zinc-400 text-center mb-8">
          Watch YouTube videos in sync with your girlfriend, in real time.
        </p>

        <button
          onClick={createRoom}
          className="w-full mb-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition font-semibold"
        >
          Create a Room
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-px bg-zinc-700" />
          <span className="text-zinc-400 text-sm">OR</span>
          <div className="flex-1 h-px bg-zinc-700" />
        </div>

        <div className="flex gap-2">
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter room ID"
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 outline-none focus:border-red-500"
          />
          <button
            onClick={joinRoom}
            className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition font-medium"
          >
            Join
          </button>
        </div>
      </div>
    </main>
  );
}
