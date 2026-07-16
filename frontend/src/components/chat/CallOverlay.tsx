import { useEffect, useRef } from "react";
import { useCallStore } from "@/stores/useCallStore";
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from "lucide-react";
import UserAvatar from "./UserAvatar";

const CallOverlay = () => {
  const {
    callState,
    targetUserName,
    targetUserAvatar,
    remoteStream,
    isMuted,
    callDuration,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    incrementDuration,
  } = useCallStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Handle active call timer
  useEffect(() => {
    let timer: any;
    if (callState === "active") {
      timer = setInterval(() => {
        incrementDuration();
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callState, incrementDuration]);

  // Handle remote audio stream binding
  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
      audioRef.current.play().catch((err) => {
        console.error("Error playing remote audio stream", err);
      });
    }
  }, [remoteStream, callState]);

  if (callState === "idle") return null;

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in">
      {/* Hidden audio element to play remote stream */}
      <audio ref={audioRef} autoPlay />

      <div className="relative w-full max-w-sm mx-4 bg-background/85 border border-border/40 p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-between text-center overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />

        {/* Content Wrapper */}
        <div className="w-full flex flex-col items-center gap-6 my-6 z-10">
          {/* Pulsing Avatar Wrapper */}
          <div className="relative flex items-center justify-center">
            {callState !== "active" && (
              <>
                <div className="absolute w-32 h-32 bg-primary/20 rounded-full animate-ping pointer-events-none" />
                <div className="absolute w-28 h-28 bg-primary/10 rounded-full animate-pulse pointer-events-none" />
              </>
            )}
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/50 shadow-lg">
              <UserAvatar
                type="sidebar"
                name={targetUserName || "Moji"}
                avatarUrl={targetUserAvatar || undefined}
              />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-foreground tracking-tight">
              {targetUserName || "Người dùng"}
            </h3>
            <p className="text-sm font-medium text-muted-foreground/80 mt-1">
              {callState === "calling" && "Đang gọi..."}
              {callState === "incoming" && "Cuộc gọi thoại đến..."}
              {callState === "active" && "Trong cuộc gọi thoại"}
            </p>
          </div>

          {callState === "active" && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl font-mono font-semibold tracking-wider text-primary">
                {formatDuration(callDuration)}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>Đang kết nối</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="w-full flex items-center justify-center gap-6 mt-8 z-10">
          {callState === "calling" && (
            <button
              onClick={endCall}
              className="p-4 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-red-500/20"
              title="Hủy cuộc gọi"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          )}

          {callState === "incoming" && (
            <>
              <button
                onClick={rejectCall}
                className="p-4 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-red-500/20"
                title="Từ chối"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              <button
                onClick={acceptCall}
                className="p-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-emerald-500/20 animate-pulse"
                title="Nhận cuộc gọi"
              >
                <Phone className="w-6 h-6" />
              </button>
            </>
          )}

          {callState === "active" && (
            <>
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full border transition-all duration-200 active:scale-95 ${
                  isMuted
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
                    : "bg-muted border-border hover:bg-muted/80 text-foreground"
                }`}
                title={isMuted ? "Bật mic" : "Tắt mic"}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <button
                onClick={endCall}
                className="p-4 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-red-500/20"
                title="Kết thúc cuộc gọi"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallOverlay;
