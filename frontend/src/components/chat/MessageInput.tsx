import { useAuthStore } from "@/stores/useAuthStore";
import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { ImagePlus, Send, Paperclip, Mic, Square, Trash2 } from "lucide-react";
import { Input } from "../ui/input";
import type { Conversation } from "@/types/chat";
import EmojiPicker from "./EmojiPicker";
import { useChatStore } from "@/stores/useChatStore";

const MessageInput = ({ selectedConvo }: { selectedConvo: Conversation }) => {
  const { user } = useAuthStore();
  const [value, setValue] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [previewUrls]);

  if (!user) return;
  const { sendDirectMessage, sendGroupMessage } = useChatStore();

  const handleKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await sendMessage();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...files]);
      const urls = files.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...urls]);
    }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setVoiceBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setVoiceBlob(null);
    setRecordingDuration(0);
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const sendMessage = async () => {
    if (!value.trim() && selectedImages.length === 0 && !selectedFile && !voiceBlob) return;
    
    const messageContent = value;
    const imagesToSend = selectedImages;
    const fileToSend = selectedFile;
    const voiceFile = voiceBlob ? new File([voiceBlob], "voice.webm", { type: "audio/webm" }) : null;
    const durationToSend = voiceBlob ? recordingDuration : null;

    setValue("");
    setSelectedImages([]);
    setPreviewUrls([]);
    setSelectedFile(null);
    setVoiceBlob(null);
    setRecordingDuration(0);

    if (selectedConvo.type === "direct") {
      const participants = selectedConvo.participants;
      const otherUser = participants.filter((p) => p._id !== user._id)[0];
      await sendDirectMessage(otherUser._id, messageContent, imagesToSend, fileToSend, voiceFile, durationToSend);
    }
    else {
      await sendGroupMessage(selectedConvo._id, messageContent, imagesToSend, fileToSend, voiceFile, durationToSend);
    }
  };

  return (
    <div className="flex flex-col w-full bg-background border-t border-border/40">
      {/* Image previews */}
      {previewUrls.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/20 border-b border-border/30 max-h-32 overflow-y-auto">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group size-16 rounded-md overflow-hidden border border-border/60 shadow-sm">
              <img src={url} alt="preview" className="size-full object-cover" />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black/80 text-white rounded-full size-4 flex items-center justify-center text-xs transition-smooth"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File preview */}
      {selectedFile && (
        <div className="flex items-center justify-between p-2 mx-3 my-2 bg-muted/40 border border-border/55 rounded-lg text-sm">
          <div className="flex items-center gap-2 truncate">
            <Paperclip className="size-4 text-muted-foreground shrink-0" />
            <span className="truncate font-medium">{selectedFile.name}</span>
            <span className="text-xs text-muted-foreground">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)} className="size-7 hover:bg-destructive/10 text-destructive">
            <Trash2 className="size-4" />
          </Button>
        </div>
      )}

      {/* Voice message ready preview */}
      {voiceBlob && !isRecording && (
        <div className="flex items-center justify-between p-2 mx-3 my-2 bg-muted/40 border border-border/55 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <Mic className="size-4 text-primary shrink-0 animate-pulse" />
            <span className="font-medium">Tin nhắn thoại ghi âm</span>
            <span className="text-xs text-muted-foreground">({formatDuration(recordingDuration)})</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setVoiceBlob(null)} className="size-7 hover:bg-destructive/10 text-destructive">
            <Trash2 className="size-4" />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2 p-3 min-h-[56px]">
        {/* Hidden inputs */}
        <input
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
        <input
          type="file"
          ref={docInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {isRecording ? (
          /* Recording controls */
          <div className="flex items-center justify-between w-full bg-red-50/50 dark:bg-red-950/20 border border-red-200/50 rounded-lg p-1.5 px-3">
            <div className="flex items-center gap-2">
              <span className="size-2 bg-red-500 rounded-full animate-ping" />
              <span className="text-xs font-semibold text-red-500">Đang ghi âm ({formatDuration(recordingDuration)})</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelRecording}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs px-2 h-7"
              >
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={stopRecording}
                className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 h-7 gap-1"
              >
                <Square className="size-3 fill-current" /> Dừng
              </Button>
            </div>
          </div>
        ) : (
          /* Normal controls */
          <>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                className="hover:bg-primary/10 transition-smooth"
                disabled={!!selectedFile || !!voiceBlob}
              >
                <ImagePlus className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => docInputRef.current?.click()}
                className="hover:bg-primary/10 transition-smooth"
                disabled={selectedImages.length > 0 || !!voiceBlob}
              >
                <Paperclip className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={startRecording}
                className="hover:bg-primary/10 transition-smooth text-primary-glow"
                disabled={selectedImages.length > 0 || !!selectedFile || !!voiceBlob}
              >
                <Mic className="size-4" />
              </Button>
            </div>

            <div className="flex-1 relative">
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Soạn tin nhắn..."
                className="pr-20 h-9 bg-white border-border/50 focus:border-primary/50 transition-smooth resize-none"
                disabled={!!voiceBlob}
              ></Input>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="size-8 hover:bg-primary/10 transition-smooth"
                  disabled={!!voiceBlob}
                >
                  <div>
                    <EmojiPicker
                      onChange={(emoji: string) => setValue(`${value}${emoji}`)}
                    />
                  </div>
                </Button>
              </div>
            </div>

            <Button
              onClick={sendMessage}
              className="bg-gradient-chat hover:shadow-glow transition-smooth hover:scale-105"
              disabled={
                !value.trim() &&
                selectedImages.length === 0 &&
                !selectedFile &&
                !voiceBlob
              }
            >
              <Send className="size-4 text-white" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
export default MessageInput;
