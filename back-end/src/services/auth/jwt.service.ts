import jwt, { SignOptions } from 'jsonwebtoken';
import { UserPayload, JWTPayload, AuthTokens, AuthenticationError } from '../../types';
import { authConfig } from '../../config';

export class JWTService {
  /**
   * Generate access and refresh tokens for a user
   */
  static generateTokens(user: UserPayload): AuthTokens {
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      emailVerified: user.emailVerified,
      tokenVersion: user.tokenVersion,
    };

    const accessToken = jwt.sign(payload, authConfig.jwt.secret, {
      expiresIn: authConfig.jwt.accessTokenExpiry,
    } as SignOptions);

    const refreshToken = jwt.sign(
      { id: user.id, tokenVersion: user.tokenVersion },
      authConfig.jwt.refreshSecret,
      {
        expiresIn: authConfig.jwt.refreshTokenExpiry,
      } as SignOptions
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Verify and decode an access token
   */
  static verifyAccessToken(token: string): UserPayload {
    try {
      const decoded = jwt.verify(token, authConfig.jwt.secret) as JWTPayload;

      // Remove JWT-specific fields
      const { iat, exp, ...userPayload } = decoded;

      return userPayload as UserPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Access token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid access token');
      }
      throw new AuthenticationError('Token verification failed');
    }
  }

  /**
   * Verify and decode a refresh token
   */
  static verifyRefreshToken(token: string): { id: string; tokenVersion: number } {
    try {
      const decoded = jwt.verify(token, authConfig.jwt.refreshSecret) as { id: string; tokenVersion: number };
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Refresh token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      }
      throw new AuthenticationError('Refresh token verification failed');
    }
  }

  /**
   * Generate a new access token from a refresh token
   */
  static refreshAccessToken(refreshToken: string): AuthTokens {
    const { id } = this.verifyRefreshToken(refreshToken);

    // Note: In a real application, you would fetch the user from the database
    // to ensure they still exist and have current permissions
    // For now, we'll assume the refresh token is valid and contains user info

    throw new Error('Refresh token functionality requires user lookup - implement in auth service');
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  /**
   * Generate email verification token
   */
  static generateEmailVerificationToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'email_verification' },
      authConfig.jwt.secret,
      { expiresIn: authConfig.emailVerification.tokenExpiry } as SignOptions
    );
  }

  /**
   * Verify email verification token
   */
  static verifyEmailVerificationToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, authConfig.jwt.secret) as {
        userId: string;
        type: string;
      };

      if (decoded.type !== 'email_verification') {
        throw new AuthenticationError('Invalid token type');
      }

      return { userId: decoded.userId };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Email verification token has expired');
      }
      throw new AuthenticationError('Invalid email verification token');
    }
  }

  /**
   * Generate password reset token
   */
  static generatePasswordResetToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'password_reset' },
      authConfig.jwt.secret,
      { expiresIn: '1h' } // Password reset tokens expire in 1 hour
    );
  }

  /**
   * Verify password reset token
   */
  static verifyPasswordResetToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, authConfig.jwt.secret) as {
        userId: string;
        type: string;
      };

      if (decoded.type !== 'password_reset') {
        throw new AuthenticationError('Invalid token type');
      }

      return { userId: decoded.userId };
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Password reset token has expired');
      }
      throw new AuthenticationError('Invalid password reset token');
    }
  }
}

