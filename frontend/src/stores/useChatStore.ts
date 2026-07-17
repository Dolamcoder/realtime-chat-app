import { chatService } from "@/services/chatService";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./useAuthStore";
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null,
      loading: false,
      messageLoading: false,
      setActiveConversation: (id) => set({ activeConversationId: id }),
      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          loading: false,
        });
      },
      fetchConversations: async () => {
        try {
          set({ loading: true });
          const { conversations } = await chatService.fetchConversations();
          set({ conversations });
        } catch (err) {
          console.error(err);
          set({ loading: false });
        }
      },
      fetchMessages: async (conversationId) => {
        try {
          set({ messageLoading: true });
          const { activeConversationId, messages } = get();
          const { user } = useAuthStore.getState();

          const convoId = conversationId ?? activeConversationId;
          if (!convoId) return;
          const current = messages?.[convoId];
          const nextCursor =
            current?.nextCursor === undefined ? "" : current?.nextCursor;
          if (nextCursor === null) return;
          set({ messageLoading: true });
          const { messages: fetched, cursor } = await chatService.fetchMessages(
            convoId,
            nextCursor,
          );
          console.log("<<<<<check message useChatStore", messages);
          const processed = fetched.map((m) => ({
            ...m,
            isOwn: m.senderId === user?._id,
          }));
          set((state) => {
            const prev = state.messages[convoId]?.items ?? [];
            const merged =
              prev.length > 0 ? [...processed, ...prev] : processed;

            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: merged,
                  hasMore: !!cursor,
                  nextCursor: cursor ?? null,
                },
              },
            };
          });
        } catch (err) {
          console.error(err);
        } finally {
          set({ messageLoading: false });
        }
      },
      sendDirectMessage: async (conversationId, content, images = [], file = null, voice = null, voiceDuration = null) => {
        const { activeConversationId } = get();
        const { user } = useAuthStore.getState();
        if (!user) return;

        // 1. Tạo tin nhắn tạm thời để hiển thị ngay lập tức (Optimistic Update)
        const tempId = `temp-${Date.now()}`;
        const tempMsg = {
          _id: tempId,
          conversationId,
          senderId: user._id,
          content,
          imgUrls: images.map(img => URL.createObjectURL(img)),
          fileUrl: file ? URL.createObjectURL(file) : null,
          fileName: file?.name || null,
          fileType: file?.type || null,
          voiceUrl: voice ? URL.createObjectURL(voice) : null,
          voiceDuration,
          createdAt: new Date().toISOString(),
          isOwn: true,
          status: "sending" as const
        };

        // Đẩy tin nhắn tạm vào UI ngay lập tức
        await get().addMessage(tempMsg);

        try {
          const newMsg = await chatService.sendDirectMessage(
            conversationId,
            content,
            images,
            file,
            voice,
            voiceDuration,
          );

          if (newMsg) {
            // Thay thế tin nhắn tạm bằng tin nhắn thật từ server trả về
            set((state) => {
              const convoMessages = state.messages[conversationId]?.items ?? [];
              const updatedItems = convoMessages.map((m) => m._id === tempId ? { ...newMsg, tempId, isOwn: true, status: "success" as const } : m);
              return {
                messages: {
                  ...state.messages,
                  [conversationId]: {
                    ...state.messages[conversationId],
                    items: updatedItems
                  }
                }
              };
            });

            // Cập nhật cuộc trò chuyện trong sidebar
            set((state) => ({
              conversations: state.conversations.map((c) =>
                c._id === activeConversationId
                  ? {
                      ...c,
                      seenBy: [],
                      lastMessage: {
                        _id: newMsg._id,
                        content: newMsg.content || (newMsg.imgUrls?.length ? "[Hình ảnh]" : newMsg.fileUrl ? "[Tệp tin]" : ""),
                        createdAt: newMsg.createdAt,
                        sender: {
                          _id: newMsg.senderId,
                          displayName: "",
                          avatarUrl: null,
                        },
                      },
                      lastMessageAt: newMsg.createdAt,
                    }
                  : c,
              ),
            }));
          }
        } catch (err) {
          console.error(err);
          // Nếu lỗi, đánh dấu gửi thất bại
          set((state) => {
            const convoMessages = state.messages[conversationId]?.items ?? [];
            const updatedItems = convoMessages.map((m) => m._id === tempId ? { ...m, status: "error" as const } : m);
            return {
              messages: {
                ...state.messages,
                [conversationId]: {
                  ...state.messages[conversationId],
                  items: updatedItems
                }
              }
            };
          });
        }
      },
      sendGroupMessage: async (conversationId, content, images = [], file = null, voice = null, voiceDuration = null) => {
        const { activeConversationId } = get();
        const { user } = useAuthStore.getState();
        if (!user) return;

        // 1. Tạo tin nhắn tạm thời để hiển thị ngay lập tức (Optimistic Update)
        const tempId = `temp-${Date.now()}`;
        const tempMsg = {
          _id: tempId,
          conversationId,
          senderId: user._id,
          content,
          imgUrls: images.map(img => URL.createObjectURL(img)),
          fileUrl: file ? URL.createObjectURL(file) : null,
          fileName: file?.name || null,
          fileType: file?.type || null,
          voiceUrl: voice ? URL.createObjectURL(voice) : null,
          voiceDuration,
          createdAt: new Date().toISOString(),
          isOwn: true,
          status: "sending" as const
        };

        // Đẩy tin nhắn tạm vào UI ngay lập tức
        await get().addMessage(tempMsg);

        try {
          const newMsg = await chatService.sendGroupMessage(content, conversationId, images, file, voice, voiceDuration);

          if (newMsg) {
            // Thay thế tin nhắn tạm bằng tin nhắn thật từ server trả về
            set((state) => {
              const convoMessages = state.messages[conversationId]?.items ?? [];
              const updatedItems = convoMessages.map((m) => m._id === tempId ? { ...newMsg, tempId, isOwn: true, status: "success" as const } : m);
              return {
                messages: {
                  ...state.messages,
                  [conversationId]: {
                    ...state.messages[conversationId],
                    items: updatedItems
                  }
                }
              };
            });

            // Cập nhật cuộc trò chuyện trong sidebar
            set((state) => ({
              conversations: state.conversations.map((c) =>
                c._id === activeConversationId
                  ? {
                      ...c,
                      seenBy: [],
                      lastMessage: {
                        _id: newMsg._id,
                        content: newMsg.content || (newMsg.imgUrls?.length ? "[Hình ảnh]" : newMsg.fileUrl ? "[Tệp tin]" : ""),
                        createdAt: newMsg.createdAt,
                        sender: {
                          _id: newMsg.senderId,
                          displayName: "",
                          avatarUrl: null,
                        },
                      },
                      lastMessageAt: newMsg.createdAt,
                    }
                  : c,
              ),
            }));
          }
        } catch (err) {
          console.error(err);
          // Nếu lỗi, đánh dấu gửi thất bại
          set((state) => {
            const convoMessages = state.messages[conversationId]?.items ?? [];
            const updatedItems = convoMessages.map((m) => m._id === tempId ? { ...m, status: "error" as const } : m);
            return {
              messages: {
                ...state.messages,
                [conversationId]: {
                  ...state.messages[conversationId],
                  items: updatedItems
                }
              }
            };
          });
        }
      },
      addMessage: async (message) => {
        try {
          const { user } = useAuthStore.getState();
          message.isOwn = message.senderId === user?._id;
          const { fetchMessages } = get();
          const convoId = message.conversationId;
          let prevItems = get().messages[convoId]?.items ?? [];
          if (prevItems.length === 0) {
            await fetchMessages(message.conversationId);
            prevItems = get().messages[convoId]?.items ?? [];
          }
          set((state) => {
            if (prevItems.some((m) => m._id === message._id)) {
              return state;
            }
            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: [...prevItems, message],
                  hasMore: state.messages[convoId]?.hasMore ?? true,
                  nextCursor: state.messages[convoId]?.nextCursor ?? undefined
                }
              }
            }
          })
        } catch (err) {
          console.error(err)
        }
      },
      updateConversation: (conversation) => {
        set((state) => ({
          conversations: state.conversations.map((c) => c._id === conversation._id ? { ...c, ...conversation } : c),
        }))
      },
      markSeen: async (conversationId: string) => {
        try {
          const res = await chatService.markSeen(conversationId);
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === conversationId
                ? {
                  ...c,
                  seenBy: res.seenBy || [],
                  unreadCounts: {
                    ...c.unreadCounts,
                    [useAuthStore.getState().user?._id ?? ""]: 0,
                  },
                }
                : c
            ),
          }));
        } catch (err) {
          console.error(err);
        }
      }
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({ conversations: state.conversations }),
    },
  ),
);
