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
  async sendDirectMessage(
    conversationId: string,
    content: string = "",
    images: File[] = [],
    file: File | null = null,
    voice: File | null = null,
    voiceDuration: number | null = null
  ) {
    const formData = new FormData();
    formData.append("conversationId", conversationId);
    formData.append("content", content);
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append("images", image);
      });
    }
    if (file) {
      formData.append("file", file);
    }
    if (voice) {
      formData.append("voice", voice);
    }
    if (voiceDuration !== null) {
      formData.append("voiceDuration", String(voiceDuration));
    }
    const res = await api.post("/messages/direct", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.message;
  },
  async sendGroupMessage(
    content: string = "",
    conversationId: string,
    images: File[] = [],
    file: File | null = null,
    voice: File | null = null,
    voiceDuration: number | null = null
  ) {
    const formData = new FormData();
    formData.append("conversationId", conversationId);
    formData.append("content", content);
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append("images", image);
      });
    }
    if (file) {
      formData.append("file", file);
    }
    if (voice) {
      formData.append("voice", voice);
    }
    if (voiceDuration !== null) {
      formData.append("voiceDuration", String(voiceDuration));
    }
    const res = await api.post("/messages/group", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.message;
  },
  async markSeen(conversationId: String) {
    const res = await api.patch(`/conversations/${conversationId}/seen`);
    console.log("<<<<<<<<<<<updateSeenfe", res.data)
    return res.data;
  },
  async clearConversation(conversationId: string) {
    const res = await api.patch(`/conversations/${conversationId}/clear`);
    return res.data;
  },
  async deleteGroup(conversationId: string) {
    const res = await api.delete(`/conversations/${conversationId}`);
    return res.data;
  },
  async createGroupConversation(name: string, memberIds: string[]) {
    const res = await api.post("/conversations", { name, memberIds });
    return res.data;
  },
  async addMembers(conversationId: string, memberIds: string[]) {
    const res = await api.post(`/conversations/${conversationId}/members`, { memberIds });
    return res.data;
  },
  async deleteGroupMember(conversationId: string, memberId: string) {
    const res = await api.delete(`/conversations/${conversationId}/members/${memberId}`);
    return res.data;
  }
};
