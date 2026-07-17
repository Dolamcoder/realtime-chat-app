import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import DEFAULT_AVATAR from "@/assets/avatar.png"
interface IUserAvatarProps {
  type: "sidebar" | "chat" | "profile";
  name: string;
  avatarUrl?: string;
  className?: string;
}


const UserAvatar = ({
  type,
  name = "alohub",
  avatarUrl,
  className,
}: IUserAvatarProps) => {
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
        src={avatarUrl || DEFAULT_AVATAR}
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