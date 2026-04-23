import { create } from "zustand";
import {axiosInstance} from "../lib/axios.js"
import toast from "react-hot-toast"
import { useAuthStore } from "./useAuthStore.js";

export const useChatStore = create((set,get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isusersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isusersLoading: true })
        try {
            const res = await axiosInstance.get("/messages/users")
            set({users: res.data})

        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong")
        }
        finally {
            set({isusersLoading:false})
        }
    },
    getMessages: async (userId) => {
        set({ isMessagesLoading: true })
        try {
            const res = await axiosInstance.get(`/messages/${userId}`)
            set({ messages: res.data?.messages || res.data || [] })
        } catch (error) {
            toast.error(error?.response?.data?.message || "Something went wrong")
        }
        finally {
            set({isMessagesLoading:false})
        }
    },

    sendMessage: async (MessageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, MessageData);
            set({
                messages: [
                    ...(Array.isArray(messages) ? messages : []),
                    res.data
                ]
            })
        } catch (error) {
            console.error("Send message error:", error);
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    },
    setSelectedUser: (selectedUser) => set({ selectedUser }),

    subscribeToMessages: () => {
        const { selectedUser } = get()
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {
            if (newMessage.senderId !== selectedUser._id) return
            set({
                messages: [...get().messages, newMessage]
            })
        })
    },
    unSubscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage")
    }
}))
