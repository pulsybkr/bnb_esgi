import { JWTService } from '../../../services/auth/jwt.service';
import { UserPayload } from '../../../types';
import jwt from 'jsonwebtoken';
import { authConfig } from '../../../config';

describe('JWTService', () => {
    const mockUser: UserPayload = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        userType: 'locataire',
        emailVerified: true,
    };

    describe('generateTokens', () => {
        it('should generate access and refresh tokens', () => {
            const tokens = JWTService.generateTokens(mockUser);

            expect(tokens.accessToken).toBeDefined();
            expect(tokens.refreshToken).toBeDefined();

            const decoded = jwt.verify(tokens.accessToken, authConfig.jwt.secret) as any;
            expect(decoded.id).toBe(mockUser.id);
            expect(decoded.email).toBe(mockUser.email);
        });
    });

    describe('verifyAccessToken', () => {
        it('should verify and return payload for valid token', () => {
            const token = jwt.sign(mockUser, authConfig.jwt.secret);
            const result = JWTService.verifyAccessToken(token);

            expect(result.id).toBe(mockUser.id);
            expect(result.email).toBe(mockUser.email);
        });

        it('should throw AuthenticationError for invalid token', () => {
            expect(() => JWTService.verifyAccessToken('invalid-token')).toThrow('Invalid access token');
        });

        it('should throw AuthenticationError for expired token', () => {
            const token = jwt.sign(mockUser, authConfig.jwt.secret, { expiresIn: '0s' });
            expect(() => JWTService.verifyAccessToken(token)).toThrow('Access token has expired');
        });
    });

    describe('extractTokenFromHeader', () => {
        it('should extract token from Bearer header', () => {
            const token = 'some-jwt-token';
            const header = `Bearer ${token}`;
            expect(JWTService.extractTokenFromHeader(header)).toBe(token);
        });

        it('should return null if header is missing or malformed', () => {
            expect(JWTService.extractTokenFromHeader(undefined)).toBeNull();
            expect(JWTService.extractTokenFromHeader('InvalidHeader')).toBeNull();
        });
    });

    describe('Email Verification Tokens', () => {
        it('should generate and verify email verification token', () => {
            const userId = 'user-456';
            const token = JWTService.generateEmailVerificationToken(userId);
            const result = JWTService.verifyEmailVerificationToken(token);

            expect(result.userId).toBe(userId);
        });

        it('should throw for wrong token type', () => {
            const token = jwt.sign({ userId: '123', type: 'wrong' }, authConfig.jwt.secret);
            expect(() => JWTService.verifyEmailVerificationToken(token)).toThrow('Invalid token type');
        });
    });
});
