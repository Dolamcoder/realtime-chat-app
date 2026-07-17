import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import DEFAULT_AVATAR from "@/assets/avatar.png"
interface IUserAvatarProps {
  type: "sidebar" | "chat" | "profile";
  name: string;
  avatarUrl?: string;
  className?: string;
}


const _API_URL = import.meta.env.VITE_API_BACKEND_URL || "http://localhost:3000/api/v1";
const BASE_URL = _API_URL.replace(/\/api\/v1\/?$/, "");

const UserAvatar = ({
  type,
  name = "alohub",
  avatarUrl,
  className,
}: IUserAvatarProps) => {
  const resolvedUrl = avatarUrl
    ? (avatarUrl.startsWith("http") || avatarUrl.startsWith("blob") || avatarUrl.startsWith("data")
        ? avatarUrl
        : `${BASE_URL}${avatarUrl}`)
    : DEFAULT_AVATAR;

  return (
    <Avatar
      className={cn(
        type === "sidebar" && "size-10",
        type === "chat" && "size-6",
        type === "profile" && "size-20 shadow-md",
        className
      )}
    >
      <AvatarImage
        src={resolvedUrl}
        alt={name}
      />
      <AvatarFallback>
        <img
          src={DEFAULT_AVATAR}
          alt="Default avatar"
          className="h-full w-full object-cover"
        />
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;