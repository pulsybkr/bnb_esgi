/**
 * Tests d'intégration pour la messagerie
 * Teste le flux complet : Composant → Socket.IO → Service → API
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import ConversationPanel from '@/components/message/ConversationPanel.vue'
import { useSocket } from '@/composables/useSocket'
import { messageService } from '@/services/message/messageService'
import { useAuthStore } from '@/stores/auth'
import { io } from 'socket.io-client'

// Mock Socket.IO
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connected: true,
    id: 'socket-123'
  }))
}))

describe('Intégration - Messagerie', () => {
  let pinia: ReturnType<typeof createPinia>
  let authStore: ReturnType<typeof useAuthStore>
  let mockSocket: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    authStore = useAuthStore()
    authStore.setUser({
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      userType: 'locataire',
      emailVerified: true,
      phoneVerified: false,
      status: 'active',
      registrationDate: new Date().toISOString()
    })
    authStore.setTokens('mock-token', 'mock-refresh')

    mockSocket = {
      on: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
      connected: true,
      id: 'socket-123'
    }
    vi.mocked(io).mockReturnValue(mockSocket)
  })

  describe('Envoi de message', () => {
    it('devrait envoyer un message : composant → socket → API → mise à jour UI', async () => {
      // Mock API
      server.use(
        http.post('http://localhost:3333/messages', async ({ request }) => {
          const body = await request.json() as any
          return HttpResponse.json({
            success: true,
            data: {
              message: {
                id: 'msg-123',
                senderId: 'user-123',
                receiverId: body.receiverId,
                content: body.content,
                isRead: false,
                sentAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                type: body.reservationId ? 'reservation' : 'general',
                reservationId: body.reservationId || null
              }
            }
          })
        })
      )

      const otherUser = {
        id: 'user-456',
        firstName: 'Other',
        lastName: 'User',
        profilePhoto: null
      }

      const wrapper = mount(ConversationPanel, {
        props: {
          messages: [],
          otherUser,
          currentUserId: 'user-123',
          reservation: {
            id: 'res-123',
            accommodation: { title: 'Belle maison' }
          }
        },
        global: {
          plugins: [pinia]
        }
      })

      // Simule la saisie d'un message
      const input = wrapper.find('input[type="text"]')
      await input.setValue('Bonjour, je suis intéressé par votre logement')
      
      // Simule l'envoi
      const sendButton = wrapper.find('button:has(Send)')
      if (sendButton.exists()) {
        await sendButton.trigger('click')
      }

      await nextTick()

      // Vérifie que le socket a été utilisé
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'send-message',
        expect.objectContaining({
          receiverId: 'user-456',
          message: expect.objectContaining({
            content: 'Bonjour, je suis intéressé par votre logement'
          })
        })
      )
    })

    it('devrait envoyer un message via le service API', async () => {
      server.use(
        http.post('http://localhost:3333/messages', async ({ request }) => {
          const body = await request.json() as any
          return HttpResponse.json({
            success: true,
            data: {
              message: {
                id: 'msg-456',
                senderId: 'user-123',
                receiverId: body.receiverId,
                content: body.content,
                isRead: false,
                sentAt: new Date().toISOString(),
                createdAt: new Date().toISOString()
              }
            }
          })
        })
      )

      const message = await messageService.sendMessage({
        receiverId: 'user-456',
        content: 'Test message',
        reservationId: 'res-123'
      })

      expect(message).toBeTruthy()
      expect(message.id).toBe('msg-456')
      expect(message.content).toBe('Test message')
      expect(message.receiverId).toBe('user-456')
    })
  })

  describe('Réception de messages en temps réel', () => {
    it('devrait recevoir un message en temps réel via WebSocket', async () => {
      const { connect, onNewMessage } = useSocket()
      const receivedMessages: any[] = []

      connect('user-123')
      
      onNewMessage((message) => {
        receivedMessages.push(message)
      })

      // Simule la réception d'un message
      const newMessage = {
        id: 'msg-456',
        senderId: 'user-456',
        receiverId: 'user-123',
        content: 'Bonjour, le logement est disponible',
        isRead: false,
        sentAt: new Date().toISOString()
      }

      // Simule l'événement socket
      const newMessageHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'new-message'
      )?.[1]
      
      if (newMessageHandler) {
        newMessageHandler(newMessage)
      }

      await nextTick()

      expect(receivedMessages.length).toBe(1)
      expect(receivedMessages[0].content).toBe('Bonjour, le logement est disponible')
    })

    it('devrait mettre à jour l\'UI lors de la réception d\'un nouveau message', async () => {
      const wrapper = mount(ConversationPanel, {
        props: {
          messages: [],
          otherUser: {
            id: 'user-456',
            firstName: 'Other',
            lastName: 'User',
            profilePhoto: null
          },
          currentUserId: 'user-123',
          reservation: {
            id: 'res-123',
            accommodation: { title: 'Test' }
          }
        },
        global: {
          plugins: [pinia]
        }
      })

      // Simule la réception d'un message
      const newMessage = {
        id: 'msg-new',
        senderId: 'user-456',
        receiverId: 'user-123',
        content: 'Nouveau message',
        isRead: false,
        sentAt: new Date().toISOString()
      }

      // Met à jour les props
      await wrapper.setProps({
        messages: [newMessage]
      })

      await nextTick()

      // Vérifie que le message apparaît dans l'UI
      expect(wrapper.text()).toContain('Nouveau message')
    })
  })

  describe('Chargement des conversations', () => {
    it('devrait charger les conversations', async () => {
      server.use(
        http.get('http://localhost:3333/messages/conversations', () => {
          return HttpResponse.json({
            success: true,
            data: {
              conversations: [
                {
                  id: 'conv-1',
                  otherUser: {
                    id: 'user-456',
                    firstName: 'Other',
                    lastName: 'User'
                  },
                  lastMessage: {
                    content: 'Dernier message',
                    sentAt: new Date().toISOString()
                  },
                  unreadCount: 2
                }
              ]
            }
          })
        })
      )

      const conversations = await messageService.getConversations()

      expect(conversations.length).toBe(1)
      expect(conversations[0].unreadCount).toBe(2)
      expect(conversations[0].otherUser.firstName).toBe('Other')
    })

    it('devrait charger les messages d\'une réservation', async () => {
      server.use(
        http.get('http://localhost:3333/messages/reservation/res-123', () => {
          return HttpResponse.json({
            success: true,
            data: {
              messages: [
                {
                  id: 'msg-1',
                  senderId: 'user-123',
                  content: 'Message 1',
                  sentAt: new Date().toISOString()
                },
                {
                  id: 'msg-2',
                  senderId: 'user-456',
                  content: 'Message 2',
                  sentAt: new Date().toISOString()
                }
              ]
            }
          })
        })
      )

      const messages = await messageService.getReservationMessages('res-123')

      expect(messages.length).toBe(2)
      expect(messages[0].content).toBe('Message 1')
      expect(messages[1].content).toBe('Message 2')
    })
  })

  describe('Indicateurs de frappe', () => {
    it('devrait gérer les indicateurs de frappe en temps réel', async () => {
      const wrapper = mount(ConversationPanel, {
        props: {
          messages: [],
          otherUser: {
            id: 'user-456',
            firstName: 'Other',
            lastName: 'User',
            profilePhoto: null
          },
          currentUserId: 'user-123',
          reservation: {
            id: 'res-123',
            accommodation: { title: 'Test' }
          }
        },
        global: {
          plugins: [pinia]
        }
      })

      // Simule la frappe
      const input = wrapper.find('input[type="text"]')
      await input.trigger('input')

      // Vérifie que l'événement typing est émis
      expect(mockSocket.emit).toHaveBeenCalledWith(
        'typing',
        expect.objectContaining({
          reservationId: 'res-123',
          userId: 'user-123'
        })
      )

      // Simule la réception d'un indicateur de frappe
      const typingHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'user-typing'
      )?.[1]
      
      if (typingHandler) {
        typingHandler('user-456')
      }

      await nextTick()

      // Vérifie que l'indicateur apparaît
      expect(wrapper.text()).toContain('est en train d\'écrire')
    })
  })

  describe('Marquage des messages comme lus', () => {
    it('devrait marquer les messages comme lus', async () => {
      server.use(
        http.put('http://localhost:3333/messages/mark-read', async ({ request }) => {
          const body = await request.json() as any
          return HttpResponse.json({
            success: true,
            data: {
              count: body.messageIds?.length || 1
            }
          })
        })
      )

      const count = await messageService.markAsRead({
        messageIds: ['msg-1', 'msg-2']
      })

      expect(count).toBe(2)
    })

    it('devrait marquer tous les messages d\'une réservation comme lus', async () => {
      server.use(
        http.put('http://localhost:3333/messages/mark-read', async ({ request }) => {
          const body = await request.json() as any
          return HttpResponse.json({
            success: true,
            data: {
              count: 5 // Simule 5 messages marqués comme lus
            }
          })
        })
      )

      const count = await messageService.markAsRead({
        reservationId: 'res-123'
      })

      expect(count).toBe(5)
    })
  })

  describe('Compteur de messages non lus', () => {
    it('devrait récupérer le nombre de messages non lus', async () => {
      server.use(
        http.get('http://localhost:3333/messages/unread-count', () => {
          return HttpResponse.json({
            success: true,
            data: {
              unreadCount: 3
            }
          })
        })
      )

      const count = await messageService.getUnreadCount()

      expect(count).toBe(3)
    })
  })
})

