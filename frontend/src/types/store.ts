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
  sendDirectMessage: (recipientId: string, content: string) => Promise<void>;
  sendGroupMessage: (conversationId: string, content: string) => Promise<void>;
}
