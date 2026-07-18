import * as React from "react";
import type { Participant } from "@/types/chat";
import UserAvatar from "../user/UserAvatar";
import { Ellipsis } from "lucide-react";

interface GroupChatAvatarProps {
  participants: Participant[];
  type: "chat" | "sidebar";
}

const GroupChatAvatar = ({ participants, type }: GroupChatAvatarProps) => {
  const limit = 2;
  const displayedParticipants = React.useMemo(() => {
    if (participants.length > limit) {
      return [...participants].slice(0, limit);
    }
    return participants;
  }, [participants]);

  const avatars = displayedParticipants.map((member, i) => (
    <UserAvatar
      key={member._id || i}
      type={type}
      name={member.displayName}
      avatarUrl={member.avatarUrl ?? undefined}
    />
  ));

  return (
    <div className="relative flex -space-x-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:ring-2">
      {avatars}

      {participants.length > limit && (
        <div className="flex items-center z-10 justify-center size-8 rounded-full bg-primary/10 ring-2 ring-background text-primary font-bold text-xs select-none">
          +{participants.length - limit}
        </div>
      )}
    </div>
  );
};

export default GroupChatAvatar;