import { UserService } from '../../../services/user/user.service';
import { prismaMock } from '../../setup';

describe('UserService', () => {
    describe('getUserById', () => {
        it('should return user data if user exists', async () => {
            const mockUser = { id: 'user-1', email: 'test@example.com', firstName: 'John' };
            prismaMock.user.findUnique.mockResolvedValue(mockUser as any);

            const result = await UserService.getUserById('user-1');

            expect(result).toEqual(mockUser);
            expect(prismaMock.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: 'user-1' }
            }));
        });

        it('should return null if user does not exist', async () => {
            prismaMock.user.findUnique.mockResolvedValue(null);

            const result = await UserService.getUserById('non-existent');
            expect(result).toBeNull();
        });
    });

    describe('updateUserProfile', () => {
        it('should update and return user data', async () => {
            const updateData = { firstName: 'Updated' };
            const mockUser = { id: 'user-1', firstName: 'Updated' };
            prismaMock.user.update.mockResolvedValue(mockUser as any);

            const result = await UserService.updateUserProfile('user-1', updateData);

            expect(result.firstName).toBe('Updated');
            expect(prismaMock.user.update).toHaveBeenCalled();
        });
    });

    describe('getUsers', () => {
        it('should return list of users and total count', async () => {
            const mockUsers = [{ id: '1' }, { id: '2' }];
            prismaMock.user.findMany.mockResolvedValue(mockUsers as any);
            prismaMock.user.count.mockResolvedValue(2);

            const result = await UserService.getUsers();

            expect(result.users).toHaveLength(2);
            expect(result.total).toBe(2);
        });
    });
});
