import { MessageService } from '../../../services/message/message.service';
import { prismaMock } from '../../setup';

describe('MessageService', () => {
    describe('sendMessage', () => {
        it('should create a message successfully', async () => {
            const msgData: any = {
                receiverId: 'user-2',
                content: 'Hello!',
                type: 'general'
            };

            prismaMock.user.findUnique.mockResolvedValue({ id: 'user-2' } as any);
            prismaMock.message.create.mockResolvedValue({
                id: 'msg-1',
                senderId: 'user-1',
                ...msgData,
                sentAt: new Date()
            } as any);

            const result = await MessageService.sendMessage('user-1', msgData);

            expect(result.id).toBe('msg-1');
            expect(result.content).toBe('Hello!');
            expect(prismaMock.message.create).toHaveBeenCalled();
        });
    });

    describe('getUnreadCount', () => {
        it('should return unread message count', async () => {
            prismaMock.message.count.mockResolvedValue(5);

            const count = await MessageService.getUnreadCount('user-1');

            expect(count).toBe(5);
            expect(prismaMock.message.count).toHaveBeenCalledWith({
                where: { receiverId: 'user-1', isRead: false }
            });
        });
    });

    describe('markAsRead', () => {
        it('should update messages status', async () => {
            prismaMock.message.updateMany.mockResolvedValue({ count: 3 } as any);

            const count = await MessageService.markAsRead('user-1', ['m1', 'm2', 'm3']);

            expect(count).toBe(3);
            expect(prismaMock.message.updateMany).toHaveBeenCalled();
        });
    });
});
