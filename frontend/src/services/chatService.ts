import api from "@/lib/axios";
import type { ConversationResponse, MessageResponse } from "@/types/chat";
export const chatService = {
  async fetchConversations(): Promise<ConversationResponse> {
    const res = await api.get("/conversations");
    return res.data;
  },
  async fetchMessages(
    convoId: string,
    cursor: string,
  ): Promise<MessageResponse> {
    const res = await api.get(
      `/conversations/${convoId}/messages?limit=${50}&cursor=${cursor}`,
    );
    return { messages: res.data.messages, cursor: res.data.nextCursor };
  },
};
