import { cn, formatMessageTime } from "@/lib/utils";
import type { MessageItemProps, Participant } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { FileText, Download } from "lucide-react";
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
            "max-w-xs lg:max-w-md space-y-1 flex flex-col",
            message.isOwn ? "items-end" : "items-start",
          )}
        >
          <Card
            className={cn(
              message.content ? "p-3" : "p-0 bg-transparent border-0 shadow-none",
              message.isOwn && message.content
                ? "chat-bubble-sent border-0"
                : message.content
                ? "chat-bubble-received"
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
                  const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";
                  const baseUrl = socketUrl.endsWith("/") ? socketUrl.slice(0, -1) : socketUrl;
                  const cleanPath = img.startsWith("/") ? img : `/${img}`;
                  const fullUrl = `${baseUrl}${cleanPath}`;
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
              <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40 bg-muted/30 w-64 md:w-72">
                <FileText className="size-8 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{message.fileName}</p>
                  <p className="text-xs text-muted-foreground truncate">{message.fileType}</p>
                </div>
                <a
                  href={`${import.meta.env.VITE_SOCKET_URL || "http://localhost:3000"}${message.fileUrl}`}
                  download={message.fileName || "file"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-primary/10 rounded-full text-primary shrink-0 transition-smooth"
                >
                  <Download className="size-4" />
                </a>
              </div>
            )}

            {message.voiceUrl && (
              <div className="flex items-center gap-2 w-64 md:w-72">
                <audio
                  src={`${import.meta.env.VITE_SOCKET_URL || "http://localhost:3000"}${message.voiceUrl}`}
                  controls
                  className="h-9 w-full rounded focus:outline-none"
                />
              </div>
            )}
          </Card>
          {/* seen/ delivered */}
          {message.isOwn && message._id === selectedConvo.lastMessage?._id && (
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
