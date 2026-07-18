import type { Socket } from "socket.io-client";
import type { Conversation, Message } from "./chat";
import type { User } from "./user";
export interface AuthState {
  accessToken: String | null;
  user: User | null;
  loading: boolean;
  clearState: () => void;
  setAccessToken: (accessToken: String) => void;
  signUp: (
    username: String,
    password: String,
    email: String,
    firstname: String,
    lastname: String,
  ) => Promise<void>;
  signIn: (username: String, password: String) => Promise<void>;
  signOut: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (displayName: string, bio: string, phone: string) => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}
export interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}
export interface ChatState {
  conversations: Conversation[];
  messages: Record<
    string,
    {
      items: Message[];
      hasMore: boolean;
      nextCursor?: string | null;
    }
  >;
  activeConversationId: string | null;
  loading: boolean;
  messageLoading: boolean;
  reset: () => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  setActiveConversation: (id: string | null) => void;
  sendDirectMessage: (recipientId: string, content: string, images?: File[], file?: File | null, voice?: File | null, voiceDuration?: number | null) => Promise<void>;
  sendGroupMessage: (conversationId: string, content: string, images?: File[], file?: File | null, voice?: File | null, voiceDuration?: number | null) => Promise<void>;
  addMessage: (message: Message) => Promise<void>;
  updateConversation: (conversation: Conversation) => void;
  markSeen: (conversationId: string) => Promise<void>;
  clearConversation: (conversationId: string) => Promise<void>;
  deleteGroup: (conversationId: string) => Promise<void>;
  createGroupConversation: (name: string, memberIds: string[]) => Promise<void>;
  addMembers: (conversationId: string, memberIds: string[]) => Promise<void>;
  removeMember: (conversationId: string, memberId: string) => Promise<void>;
}
export interface SocketState {
  socket: Socket | null;
  onlineUsers: string[];
  connectSocket: () => void;
  disconnectSocket: () => void;

}