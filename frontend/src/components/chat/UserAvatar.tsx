import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface IUserAvatarProps {
  type: "sidebar" | "chat" | "profile";
  name: string;
  avatarUrl?: string;
  className?: string;
}

const UserAvatar = ({ type, name, avatarUrl, className }: IUserAvatarProps) => {
  const bgColor = !avatarUrl ? "bg-blue-500" : "";

  if (!name) {
    name = "alohub";
  }

  return (
    <Avatar
      className={cn(
        type === "sidebar" && "size-10 text-base",
        type === "chat" && "size-6 text-sm",
        type === "profile" && "size-20 text-3xl shadow-md",
        className ?? "",
      )}
    >
      <AvatarImage
        src={avatarUrl}
        alt={name}
      />
      <AvatarFallback className={`${bgColor} text-white font-semibold`}>
        {name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;