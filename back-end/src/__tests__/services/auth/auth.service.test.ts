import { AuthService } from '../../../services/auth/auth.service';
import { prismaMock } from '../../setup';
import { PasswordService } from '../../../services/auth/password.service';
import { JWTService } from '../../../services/auth/jwt.service';
import { RegisterData, LoginData } from '../../../types';

describe('AuthService', () => {
    describe('register', () => {
        const registerData: RegisterData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
            userType: 'locataire',
        };

        it('should register a new user successfully', async () => {
            prismaMock.user.findUnique.mockResolvedValue(null);
            prismaMock.user.create.mockResolvedValue({
                id: 'user-1',
                ...registerData,
                passwordHash: 'hashed-password',
                emailVerified: false,
                phoneVerified: false,
                status: 'actif',
                registrationDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            } as any);
            prismaMock.user.update.mockResolvedValue({} as any); // Mock for updateLastLogin

            const result = await AuthService.register(registerData);

            expect(result.user.email).toBe(registerData.email);
            expect(result.tokens).toBeDefined();
            expect(prismaMock.user.create).toHaveBeenCalled();
        });

        it('should throw ValidationError if email already exists', async () => {
            prismaMock.user.findUnique.mockResolvedValue({ id: 'existing' } as any);

            await expect(AuthService.register(registerData)).rejects.toThrow('User with this email already exists');
        });
    });

    describe('login', () => {
        const loginData: LoginData = {
            email: 'john@example.com',
            password: 'password123',
        };

        it('should login successfully with correct credentials', async () => {
            const mockUser = {
                id: 'user-1',
                email: loginData.email,
                passwordHash: 'hashed-password',
                firstName: 'John',
                lastName: 'Doe',
                userType: 'locataire',
                status: 'actif',
                emailVerified: true,
            };

            prismaMock.user.findUnique.mockResolvedValue(mockUser as any);
            prismaMock.user.update.mockResolvedValue({} as any); // Mock for updateLastLogin
            jest.spyOn(PasswordService, 'verifyPassword').mockResolvedValue(true);

            const result = await AuthService.login(loginData);

            expect(result.user.id).toBe(mockUser.id);
            expect(result.tokens).toBeDefined();
        });

        it('should throw AuthenticationError for invalid credentials', async () => {
            prismaMock.user.findUnique.mockResolvedValue(null);

            await expect(AuthService.login(loginData)).rejects.toThrow('Invalid email or password');
        });

        it('should throw AuthenticationError if account is not active', async () => {
            prismaMock.user.findUnique.mockResolvedValue({
                id: 'user-1',
                status: 'suspendu',
                passwordHash: 'hash'
            } as any);
            jest.spyOn(PasswordService, 'verifyPassword').mockResolvedValue(true);

            await expect(AuthService.login(loginData)).rejects.toThrow('Account is not active');
        });
    });
});
