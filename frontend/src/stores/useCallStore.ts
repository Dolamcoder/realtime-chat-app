import { create } from "zustand";
import { useSocketStore } from "./useSocketStore";
import { toast } from "sonner";

interface CallState {
  callState: "idle" | "calling" | "incoming" | "active";
  targetUserId: string | null;
  targetUserName: string | null;
  targetUserAvatar: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isMuted: boolean;
  callDuration: number;
  pendingOffer: any | null;
  peerConnection: RTCPeerConnection | null;
  iceCandidatesQueue: RTCIceCandidateInit[];
  callType: "audio" | "video";
  isCameraOn: boolean;

  // Actions
  startCall: (targetUserId: string, name: string, avatar: string, callType: "audio" | "video") => Promise<void>;
  handleIncomingCall: (data: { from: string; offer: any; callerName: string; callerAvatar: string; callType: "audio" | "video" }) => void;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  handleCallAccepted: (data: { answer: any }) => Promise<void>;
  handleIceCandidate: (data: { candidate: any }) => Promise<void>;
  handleCallRejected: () => void;
  handleCallEnded: () => void;
  endCall: () => void;
  endCallLocal: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
  incrementDuration: () => void;
}

// Ringtone generator using Web Audio API
class AudioToneGenerator {
  private audioCtx: AudioContext | null = null;
  private intervalId: any = null;

  startRinging() {
    this.stop();
    try {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = () => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, this.audioCtx.currentTime); // A4
        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 1.2);
      };
      playTone();
      this.intervalId = setInterval(playTone, 2000);
    } catch (e) {
      console.warn("Failed to start ringing tone", e);
    }
  }

  startDialing() {
    this.stop();
    try {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = () => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(350, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, this.audioCtx.currentTime + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.6);
      };
      playTone();
      this.intervalId = setInterval(playTone, 1500);
    } catch (e) {
      console.warn("Failed to start dialing tone", e);
    }
  }

  playEndCall() {
    this.stop();
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Failed to play end call tone", e);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

const toneGenerator = new AudioToneGenerator();

// ICE Server configuration - using public Google STUN servers
const iceConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export const useCallStore = create<CallState>((set, get) => ({
  callState: "idle",
  targetUserId: null,
  targetUserName: null,
  targetUserAvatar: null,
  localStream: null,
  remoteStream: null,
  isMuted: false,
  callDuration: 0,
  pendingOffer: null,
  peerConnection: null,
  iceCandidatesQueue: [],
  callType: "audio",
  isCameraOn: false,

  startCall: async (targetUserId, name, avatar, callType) => {
    try {
      console.log("Emit call-user", { callType });
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Trình duyệt không hỗ trợ truy cập Micro hoặc kết nối không an toàn (Yêu cầu HTTPS hoặc localhost).");
      }
      toneGenerator.startDialing();

      const localStream = await navigator.mediaDevices.getUserMedia(
        callType === "video"
          ? { audio: true, video: { width: { ideal: 1280 }, height: { ideal: 720 } } }
          : { audio: true, video: false }
      );

      const pc = new RTCPeerConnection(iceConfiguration);

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          set({ remoteStream: event.streams[0] });
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const socket = useSocketStore.getState().socket;
          if (socket) {
            socket.emit("ice-candidate", {
              to: targetUserId,
              candidate: event.candidate,
            });
          }
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const socket = useSocketStore.getState().socket;
      if (socket) {
        socket.emit("call-user", {
          to: targetUserId,
          offer,
          callerName: name, // Caller details
          callerAvatar: avatar,
          callType,
        });
      }

      set({
        callState: "calling",
        targetUserId,
        targetUserName: name,
        targetUserAvatar: avatar,
        localStream,
        peerConnection: pc,
        callDuration: 0,
        isMuted: false,
        callType,
        isCameraOn: callType === "video",
      });
    } catch (error: any) {
      console.error("Failed to start call", error);
      toast.error(error.message || "Không thể bắt đầu cuộc gọi");
      toneGenerator.stop();
      get().endCallLocal();
    }
  },

  handleIncomingCall: ({ from, offer, callerName, callerAvatar, callType }) => {
    const currentCallState = get().callState;
    if (currentCallState !== "idle") {
      // Busy: automatically reject or ignore
      const socket = useSocketStore.getState().socket;
      if (socket) {
        socket.emit("reject-call", { to: from });
      }
      return;
    }

    toneGenerator.startRinging();
    set({
      callState: "incoming",
      targetUserId: from,
      targetUserName: callerName,
      targetUserAvatar: callerAvatar,
      pendingOffer: offer,
      callDuration: 0,
      isMuted: false,
      callType,
      isCameraOn: false,
    });
  },

  acceptCall: async () => {
    const { targetUserId, pendingOffer, callType } = get();
    if (!targetUserId || !pendingOffer) return;

    toneGenerator.stop();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Trình duyệt không hỗ trợ truy cập Micro hoặc kết nối không an toàn (Yêu cầu HTTPS hoặc localhost).");
      }
      const localStream = await navigator.mediaDevices.getUserMedia(
        callType === "video"
          ? { audio: true, video: { width: { ideal: 1280 }, height: { ideal: 720 } } }
          : { audio: true, video: false }
      );

      const pc = new RTCPeerConnection(iceConfiguration);

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          set({ remoteStream: event.streams[0] });
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const socket = useSocketStore.getState().socket;
          if (socket) {
            socket.emit("ice-candidate", {
              to: targetUserId,
              candidate: event.candidate,
            });
          }
        }
      };

      await pc.setRemoteDescription(new RTCSessionDescription(pendingOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const socket = useSocketStore.getState().socket;
      if (socket) {
        socket.emit("call-accepted", {
          to: targetUserId,
          answer,
        });
      }

      set({
        callState: "active",
        localStream,
        peerConnection: pc,
        isCameraOn: callType === "video",
      });

      // Flush any queued candidates
      const queue = get().iceCandidatesQueue;
      for (const candidate of queue) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
      set({ iceCandidatesQueue: [] });

    } catch (error: any) {
      console.error("Error accepting call", error);
      toast.error(error.message || "Không thể đồng ý cuộc gọi");
      get().rejectCall();
    }
  },

  rejectCall: () => {
    const { targetUserId } = get();
    toneGenerator.stop();
    if (targetUserId) {
      const socket = useSocketStore.getState().socket;
      if (socket) {
        socket.emit("reject-call", { to: targetUserId });
      }
    }
    get().endCallLocal();
  },

  handleCallAccepted: async ({ answer }) => {
    const pc = get().peerConnection;
    if (!pc) return;

    toneGenerator.stop();
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      set({ callState: "active" });

      // Flush candidates
      const queue = get().iceCandidatesQueue;
      for (const candidate of queue) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
      set({ iceCandidatesQueue: [] });
    } catch (e) {
      console.error("Error setting remote description from answer", e);
      get().endCall();
    }
  },

  handleIceCandidate: async ({ candidate }) => {
    const pc = get().peerConnection;
    if (pc && pc.remoteDescription) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding ice candidate", e);
      }
    } else {
      // Queue candidate for later
      set((state) => ({
        iceCandidatesQueue: [...state.iceCandidatesQueue, candidate],
      }));
    }
  },

  handleCallRejected: () => {
    toneGenerator.playEndCall();
    get().endCallLocal();
  },

  handleCallEnded: () => {
    toneGenerator.playEndCall();
    get().endCallLocal();
  },

  endCall: () => {
    const { targetUserId } = get();
    toneGenerator.playEndCall();
    if (targetUserId) {
      const socket = useSocketStore.getState().socket;
      if (socket) {
        socket.emit("end-call", { to: targetUserId });
      }
    }
    get().endCallLocal();
  },

  endCallLocal: () => {
    toneGenerator.stop();
    const { localStream, remoteStream, peerConnection } = get();

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection) {
      peerConnection.close();
    }

    set({
      callState: "idle",
      targetUserId: null,
      targetUserName: null,
      targetUserAvatar: null,
      localStream: null,
      remoteStream: null,
      isMuted: false,
      callDuration: 0,
      pendingOffer: null,
      peerConnection: null,
      iceCandidatesQueue: [],
      callType: "audio",
      isCameraOn: false,
    });
  },

  toggleMute: () => {
    const { localStream, isMuted } = get();
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
      set({ isMuted: !isMuted });
    }
  },

  toggleCamera: () => {
    const { localStream, isCameraOn } = get();
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOn;
      });
      set({ isCameraOn: !isCameraOn });
    }
  },

  incrementDuration: () => {
    set((state) => ({ callDuration: state.callDuration + 1 }));
  },
}));
