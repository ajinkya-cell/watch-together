export function extractYouTubeId(url: string): string | null {
  const regex =
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]{11})/;

  const match = url.match(regex);
  return match ? match[1] : null;
}
