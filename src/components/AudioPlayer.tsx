import { useEffect, useRef } from "react";

export default function AudioPlayer({
  audioUrl,
  mimeType,
}: {
  audioUrl: string;
  mimeType: string;
}) {
  const audioPlayer = useRef<HTMLAudioElement>(null);
  const audioSource = useRef<HTMLSourceElement>(null);

  // Updates src when url changes
  useEffect(() => {
    if (audioPlayer.current && audioSource.current) {
      audioSource.current.src = audioUrl;
      (audioPlayer.current as HTMLAudioElement).load();
    }
  }, [audioUrl]);

  return (
    <div className="flex relative z-10 my-4 w-full">
      <audio
        ref={audioPlayer}
        controls
        className="w-full h-14 rounded-lg bg-white shadow-xl shadow-black/5 ring-1 ring-slate-700/10"
      >
        <source ref={audioSource} type={mimeType}></source>
      </audio>
    </div>
  );
}
