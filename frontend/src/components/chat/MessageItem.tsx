import { cn, formatMessageTime } from "@/lib/utils";
import type { MessageItemProps, Participant } from "@/types/chat";
import UserAvatar from "../user/UserAvatar";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { FileText, Download } from "lucide-react";

const _API_URL = import.meta.env.VITE_API_BACKEND_URL || "http://localhost:3000/api/v1";
const BASE_URL = _API_URL.replace(/\/api\/v1\/?$/, "");

const MessageItem = ({
  message,
  index,
  messages,
  selectedConvo,
  lastMessageStatus,
}: MessageItemProps) => {
  const check = message.isOwn && message._id === selectedConvo.lastMessage?._id;
  console.log("<<<<<check ", check)
  console.log("<<<<status", message);
  console.log("<<<<<check convo", selectedConvo);
  const msgIndex = messages.indexOf(message);
  const prev = msgIndex > 0 ? messages[msgIndex - 1] : undefined;
  const isGroupBreak =
    msgIndex === 0 ||
    message.senderId !== prev?.senderId ||
    new Date(message.createdAt).getTime() -
    new Date(prev?.createdAt || 0).getTime() >
    120000;
  const participant = selectedConvo.participants.find(
    (p: Participant) => p?._id?.toString() === message?.senderId?.toString(),
  );

  return (
    <>
      <div
        className={cn(
          "flex gap-2 message-bounce mt-1",
          message.isOwn ? "justify-end" : "justify-start",
        )}
      >
        {/* avatar */}
        {!message.isOwn && (
          <div className="w-8">
            {isGroupBreak && (
              <UserAvatar
                type="chat"
                name={participant?.displayName ?? ""}
                avatarUrl={participant?.avatarUrl ?? undefined}
              ></UserAvatar>
            )}
          </div>
        )}
        {/* tin nhắn */}
        <div
          className={cn(
            "max-w-[75vw] sm:max-w-xs lg:max-w-md space-y-1 flex flex-col",
            message.isOwn ? "items-end" : "items-start",
          )}
        >
          {(() => {
            const hasMedia = !!(message.voiceUrl || message.fileUrl || (message.imgUrls && message.imgUrls.length > 0));
            const hasContent = !!message.content;
            const needsBubble = hasContent || message.fileUrl;

            return (
              <Card
                className={cn(
                  // Padding: có content hoặc file thì p-3, chỉ có image thì p-0, voice thì p-2
                  hasContent || message.fileUrl ? "p-3"
                    : message.voiceUrl ? "p-2"
                      : "p-0 bg-transparent border-0 shadow-none",
                  // Bubble color
                  message.isOwn && needsBubble
                    ? "chat-bubble-sent border-0"
                    : needsBubble
                      ? "chat-bubble-received"
                      : message.isOwn && message.voiceUrl
                        ? "bg-primary/10 border border-primary/20"
                        : message.voiceUrl
                          ? "bg-muted/60 border border-border/40"
                          : "",
                )}
              >
                {message.content && (
                  <p className="text-sm leading-relaxed break-words">
                    {message.content}
                  </p>
                )}

                {message.imgUrls && message.imgUrls.length > 0 && (
                  <div className={cn(
                    "grid gap-1.5 max-w-[280px]",
                    message.content ? "mt-2" : "",
                    message.imgUrls.length === 1 ? "grid-cols-1" :
                      message.imgUrls.length === 2 ? "grid-cols-2" : "grid-cols-3"
                  )}>
                    {message.imgUrls.map((img, idx) => {
                      const cleanPath = img.startsWith("/") ? img : `/${img}`;
                      const fullUrl = `${BASE_URL}${cleanPath}`;
                      return (
                        <div key={idx} className="relative rounded overflow-hidden border border-border/30 bg-muted aspect-square">
                          <a href={fullUrl} target="_blank" rel="noopener noreferrer">
                            <img
                              src={fullUrl}
                              alt="uploaded image"
                              className="size-full object-cover hover:scale-105 transition-smooth cursor-pointer"
                            />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}

                {message.fileUrl && (
                  <div className="flex items-center gap-3 rounded-lg w-full max-w-[280px]">
                    <FileText
                      className={cn(
                        "size-8 shrink-0",
                        message.isOwn ? "text-white" : "text-primary"
                      )}
                    />

                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-semibold truncate",
                          message.isOwn ? "text-white" : "text-foreground"
                        )}
                      >
                        {message.fileName}
                      </p>

                      <p
                        className={cn(
                          "text-xs truncate",
                          message.isOwn ? "text-white/80" : "text-muted-foreground"
                        )}
                      >
                        {message.fileType}
                      </p>
                    </div>

                    <a
                      href={`${BASE_URL}${message.fileUrl}`}
                      download={message.fileName || "file"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "p-1.5 rounded-full shrink-0 transition-colors",
                        message.isOwn
                          ? "text-white hover:bg-white/15"
                          : "text-primary hover:bg-primary/10"
                      )}
                    >
                      <Download className="size-4" />
                    </a>
                  </div>
                )}

                {message.voiceUrl && (
                  <div className="flex items-center w-full" style={{ minWidth: "200px", maxWidth: "260px" }}>
                    <audio
                      src={`${BASE_URL}${message.voiceUrl}`}
                      controls
                      controlsList="nodownload"
                      className="w-full rounded"
                      style={{ height: "36px", minWidth: 0 }}
                    />
                  </div>
                )}
              </Card>
            );
          })()}

          {/* seen/ delivered */}
          {message.isOwn && message.status !== "sending" && message.status !== "error" && message._id === selectedConvo.lastMessage?._id && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs px-1.5 py-0.5 h-4 border-0",
                lastMessageStatus === "seen"
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {lastMessageStatus}
            </Badge>
          )}

          {/* status (sending/error) */}
          {message.isOwn && message.status === "sending" && (
            <span className="text-[10px] text-muted-foreground/60 select-none animate-pulse">
              Đang gửi...
            </span>
          )}
          {message.isOwn && message.status === "error" && (
            <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 select-none" title="Gửi tin nhắn thất bại">
              ⚠️ Gửi lỗi ❗
            </span>
          )}
        </div>
      </div>

      {isGroupBreak && (
        <div className="flex items-center justify-center my-3 w-full gap-3 px-4 select-none">
          <div className="h-[1px] bg-border flex-1 opacity-30" />
          <span className="text-[11px] text-muted-foreground font-medium">
            {formatMessageTime(new Date(message.createdAt))}
          </span>
          <div className="h-[1px] bg-border flex-1 opacity-30" />
        </div>
      )}
    </>
  );
};
export default MessageItem;
