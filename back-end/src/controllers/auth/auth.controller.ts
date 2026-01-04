import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/auth';
import { AuthenticatedRequest, RegisterData, LoginData, RefreshTokenData, ChangePasswordData, PasswordResetData, ResetPasswordData } from '../../types';
import { authConfig } from '../../config';

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: RegisterData = req.body;
      const result = await AuthService.register(userData);

      // Set HTTP-only cookies
      res.cookie(authConfig.cookies.accessToken.name, result.tokens.accessToken, authConfig.cookies.accessToken);
      res.cookie(authConfig.cookies.refreshToken.name, result.tokens.refreshToken, authConfig.cookies.refreshToken);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Authenticate user and return tokens
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const credentials: LoginData = req.body;
      const result = await AuthService.login(credentials);

      // Set HTTP-only cookies
      res.cookie(authConfig.cookies.accessToken.name, result.tokens.accessToken, authConfig.cookies.accessToken);
      res.cookie(authConfig.cookies.refreshToken.name, result.tokens.refreshToken, authConfig.cookies.refreshToken);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken }: RefreshTokenData = req.body;
      const result = await AuthService.refreshToken(refreshToken);

      // Set new HTTP-only cookies
      res.cookie(authConfig.cookies.accessToken.name, result.tokens.accessToken, authConfig.cookies.accessToken);
      res.cookie(authConfig.cookies.refreshToken.name, result.tokens.refreshToken, authConfig.cookies.refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user by clearing cookies
   */
  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;

      if (authReq.user?.id) {
        await AuthService.logout(authReq.user.id);
      }

      // Clear cookies
      res.clearCookie(authConfig.cookies.accessToken.name);
      res.clearCookie(authConfig.cookies.refreshToken.name);

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;

      if (!authReq.user) {
        throw new Error('User not authenticated');
      }

      const user = await AuthService.getUserById(authReq.user.id);

      if (!user) {
        throw new Error('User not found');
      }

      res.json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change user password
   */
  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const { currentPassword, newPassword }: ChangePasswordData = req.body;

      if (!authReq.user?.id) {
        throw new Error('User not authenticated');
      }

      await AuthService.changePassword(authReq.user.id, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email }: PasswordResetData = req.body;

      await AuthService.requestPasswordReset(email);

      // Always return success for security (don't reveal if email exists)
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword }: ResetPasswordData = req.body;

      await AuthService.resetPassword(token, newPassword);

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify user email
   */
  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;

      await AuthService.verifyEmail(token);

      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if user is authenticated
   */
  static async checkAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;

      if (!authReq.user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: authReq.user,
          authenticated: true,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if user is a proprietaire (owner)
   */
  static async checkIsOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;

      if (!authReq.user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
        return;
      }

      const isOwner = authReq.user.userType === 'proprietaire' || authReq.user.userType === 'admin';

      res.json({
        success: true,
        data: {
          isOwner,
          userType: authReq.user.userType,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check if user is an admin
   */
  static async checkIsAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;

      if (!authReq.user) {
        res.status(401).json({
          success: false,
          message: 'Not authenticated',
        });
        return;
      }

      const isAdmin = authReq.user.userType === 'admin';

      res.json({
        success: true,
        data: {
          isAdmin,
          userType: authReq.user.userType,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

