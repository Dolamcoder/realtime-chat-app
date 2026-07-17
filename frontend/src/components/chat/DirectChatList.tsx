import { useChatStore } from "@/stores/useChatStore";
import DirectMessageCard from "./DirectChatCard";

const DirectChatList = () => {
    const { conversations } = useChatStore();
    if (!conversations) return;
    const directConversations = conversations.filter((convo) => convo.type === "direct");
    console.log("list congo direct", directConversations);
    return (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {
                directConversations.map((convo) => (
                    <DirectMessageCard
                        convo={convo}
                    />
                ))
            }
        </div>
    )
}
export default DirectChatList