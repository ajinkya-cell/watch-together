"use client";

import { useState } from "react";

interface RoomCodeProps {
  roomId: string;
}

export default function RoomCode({ roomId }: RoomCodeProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(roomId);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <span className="font-mono bg-gray-200 px-3 py-1 rounded">
        {roomId}
      </span>
      <button
        onClick={copyToClipboard}
        className="border px-3 py-1 rounded hover:bg-gray-100"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
