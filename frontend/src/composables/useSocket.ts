import { ref, onMounted, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null
const isConnected = ref(false)
const unreadCount = ref(0)

export const useSocket = () => {
    const connect = (userId: string) => {
        if (socket?.connected) return

        socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3333', {
            transports: ['websocket', 'polling'],
        })

        socket.on('connect', () => {
            console.log('Socket connected:', socket?.id)
            isConnected.value = true

            // Register user
            socket?.emit('register', userId)
        })

        socket.on('disconnect', () => {
            console.log('Socket disconnected')
            isConnected.value = false
        })

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error)
        })
    }

    const disconnect = () => {
        if (socket) {
            socket.disconnect()
            socket = null
            isConnected.value = false
        }
    }

    const joinReservation = (reservationId: string) => {
        socket?.emit('join-reservation', reservationId)
    }

    const leaveReservation = (reservationId: string) => {
        socket?.emit('leave-reservation', reservationId)
    }

    const sendMessage = (data: {
        reservationId?: string
        receiverId: string
        message: any
    }) => {
        socket?.emit('send-message', data)
    }

    const onNewMessage = (callback: (message: any) => void) => {
        socket?.on('new-message', callback)
    }

    const offNewMessage = () => {
        socket?.off('new-message')
    }

    const emitTyping = (reservationId: string, userId: string) => {
        socket?.emit('typing', { reservationId, userId })
    }

    const emitStopTyping = (reservationId: string, userId: string) => {
        socket?.emit('stop-typing', { reservationId, userId })
    }

    const onUserTyping = (callback: (userId: string) => void) => {
        socket?.on('user-typing', callback)
    }

    const onUserStoppedTyping = (callback: (userId: string) => void) => {
        socket?.on('user-stopped-typing', callback)
    }

    const onReservationStatusChanged = (callback: (data: { reservationId: string; status: string }) => void) => {
        socket?.on('reservation-status-changed', callback)
    }

    const offReservationStatusChanged = () => {
        socket?.off('reservation-status-changed')
    }

    return {
        socket,
        isConnected,
        unreadCount,
        connect,
        disconnect,
        joinReservation,
        leaveReservation,
        sendMessage,
        onNewMessage,
        offNewMessage,
        emitTyping,
        emitStopTyping,
        onUserTyping,
        onUserStoppedTyping,
        onReservationStatusChanged,
        offReservationStatusChanged,
    }
}
