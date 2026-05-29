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
  async sendDirectMessage(recipientId:string, content:string="", conversationId?:string){
    const res=await api.post("/messages/direct", {
      recipientId, content, conversationId
    })
    return res.data.message;
  },
  async sendGroupMessage(content:string="", conversationId:string){
    const res=await api.post("/messages/group", {
      content, conversationId
    })
    return res.data.message;
  }
};
