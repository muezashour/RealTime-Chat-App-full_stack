import { create } from "zustand"
import { axiosInstance } from "../lib/axios.js"
import {io} from "socket.io-client"

import toast from "react-hot-toast"

const BaseUrl = import.meta.env.MODE === "development" ? "http://localhost:5001": "/"
export const useAuthStore = create((set, get) => ({
    authUser: null,
    isChekingAuth: true,
    isSigningUp: false,
    islogingIn: false,
    isUpdatingProfile: false,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check")
            set({ authUser: res.data })
            get().connectSocket()
        } catch (error) {
            set({ authUser: null })
            console.log("error in check auth ", error)
        } finally {
            set({ isChekingAuth: false })
        }
    },
    signUp: async (data) => {
        set({ isSigningUp: true })
        try {
            const res = await axiosInstance.post("/auth/signup", data)
            set({ authUser: res.data });
            toast.success("Acount Created successful")
            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        } finally {
            set({ isSigningUp: false })
        }
    },
    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout")
            set({ authUser: null });
            toast.success("Logged out successfully")
            get().disconnectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        }
    },
    login: async (data) => {
        set({ islogingIn: true })
        try {
            const res = await axiosInstance.post("/auth/login", data)
            set({ authUser: res.data })
            toast.success("logged in successfuly")
            get().connectSocket()

        } catch (error) {
            toast.error(error.response.data.message)
        }
        finally {
            set({islogingIn:false})
        }
    },
    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
             const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("profile update successfully");

        } catch (error) {
            toast.error(error.response.data.message)
        } finally
        {
            set({ isUpdatingProfile: false });
        }
    },
    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;

        const socket = io(BaseUrl, {
            query: {
                userId: authUser._id,
            },
        });
        socket.connect();

        socket.on("connect", () => {
            console.log("Connected to socket:", socket.id);
        });

        socket.on("getOnlineUsers", (users) => {
            set({ onlineUsers: users });
        });

        set({ socket });
    },
    disconnectSocket: () => {
        const socket = get().socket;
        if (socket?.connected) socket.disconnect();
    }
}))
