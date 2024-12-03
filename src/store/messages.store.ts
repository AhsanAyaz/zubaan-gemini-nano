import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Message = {
  text: string;
  by: "user" | "ai" | "system";
  audioUrl: string | null;
  id: string;
  langCode: string;
};

type MessagesStore = {
  messages: Message[];
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  updateMessageAudio: (id: string, audioUrl: string) => void;
  clearMessages: () => void;
};

const useMessagesStore = create(
  persist<MessagesStore>(
    (set, get) => ({
      messages: [],
      addMessage: (message) =>
        set(() => ({
          messages: [...get().messages, message],
        })),
      setMessages: (messages) => set({ messages }),
      updateMessageAudio: (id, audioUrl) =>
        set(() => ({
          messages: get().messages.map((msg) =>
            msg.id === id ? { ...msg, audioUrl } : msg
          ),
        })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: "zubaan-storage", // name of the item in the storage (must be unique)
      partialize: (state) => ({
        ...state,
        messages: state.messages.map((msg) => ({
          ...msg,
          audioUrl: "", // Set audioUrl to empty string during persistence
        })),
      }),
    }
  )
);

export default useMessagesStore;
