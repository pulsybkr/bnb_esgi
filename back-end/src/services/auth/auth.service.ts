import prisma from '../../prisma/client';
import { UserPayload, RegisterData, LoginData, AuthTokens, AuthenticationError, ValidationError } from '../../types';
import { JWTService } from './jwt.service';
import { PasswordService } from './password.service';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: RegisterData): Promise<{ user: UserPayload; tokens: AuthTokens }> {
    const { firstName, lastName, email, password, phone, userType } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ValidationError('User with this email already exists', 'email');
    }

    // Validate password strength
    const passwordValidation = PasswordService.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new ValidationError(passwordValidation.errors.join(', '), 'password');
    }

    // Check if password is compromised
    const isCompromised = await PasswordService.checkPasswordCompromised(password);
    if (isCompromised) {
      throw new ValidationError('This password has been compromised. Please choose a different password.', 'password');
    }

    // Hash password
    const hashedPassword = await PasswordService.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash: hashedPassword,
        phone,
        userType,
        emailVerified: false, // Will be verified via email
        phoneVerified: false,
        status: 'actif',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        userType: true,
        emailVerified: true,
        phone: true,
        status: true,
        registrationDate: true,
        lastLogin: true,
      },
    });

    // Generate tokens
    const userPayload: UserPayload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      emailVerified: user.emailVerified,
    };

    const tokens = JWTService.generateTokens(userPayload);

    // Update last login
    await this.updateLastLogin(user.id);

    return { user: userPayload, tokens };
  }

  /**
   * Authenticate user with email and password
   */
  static async login(credentials: LoginData): Promise<{ user: UserPayload; tokens: AuthTokens }> {
    const { email, password } = credentials;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        passwordHash: true,
        userType: true,
        emailVerified: true,
        phone: true,
        status: true,
        registrationDate: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if account is active
    if (user.status !== 'actif') {
      throw new AuthenticationError('Account is not active');
    }

    // Verify password
    const isPasswordValid = await PasswordService.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Generate tokens
    const userPayload: UserPayload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      emailVerified: user.emailVerified,
    };

    const tokens = JWTService.generateTokens(userPayload);

    // Update last login
    await this.updateLastLogin(user.id);

    return { user: userPayload, tokens };
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<{ user: UserPayload; tokens: AuthTokens }> {
    // Verify refresh token
    const { id } = JWTService.verifyRefreshToken(refreshToken);

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        userType: true,
        emailVerified: true,
        status: true,
      },
    });

    if (!user || user.status !== 'actif') {
      throw new AuthenticationError('Invalid refresh token');
    }

    // Generate new tokens
    const userPayload: UserPayload = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      emailVerified: user.emailVerified,
    };

    const tokens = JWTService.generateTokens(userPayload);

    return { user: userPayload, tokens };
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<UserPayload | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        userType: true,
        emailVerified: true,
        status: true,
      },
    });

    if (!user || user.status !== 'actif') {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      userType: user.userType,
      emailVerified: user.emailVerified,
    };
  }

  /**
   * Verify user email
   */
  static async verifyEmail(token: string): Promise<void> {
    const { userId } = JWTService.verifyEmailVerificationToken(token);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ValidationError('User not found', 'token');
    }

    if (user.emailVerified) {
      throw new ValidationError('Email already verified', 'token');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) {
      throw new ValidationError('User not found', 'userId');
    }

    // Verify current password
    const isCurrentPasswordValid = await PasswordService.verifyPassword(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new ValidationError('Current password is incorrect', 'currentPassword');
    }

    // Validate new password
    const passwordValidation = PasswordService.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new ValidationError(passwordValidation.errors.join(', '), 'newPassword');
    }

    // Check if new password is compromised
    const isCompromised = await PasswordService.checkPasswordCompromised(newPassword);
    if (isCompromised) {
      throw new ValidationError('This password has been compromised. Please choose a different password.', 'newPassword');
    }

    // Hash new password
    const hashedNewPassword = await PasswordService.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedNewPassword },
    });
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, firstName: true },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return;
    }

    // Generate reset token (in production, send via email)
    const resetToken = JWTService.generatePasswordResetToken(user.id);

    // TODO: Send email with reset token
    console.log(`Password reset token for ${email}: ${resetToken}`);
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const { userId } = JWTService.verifyPasswordResetToken(token);

    // Validate new password
    const passwordValidation = PasswordService.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new ValidationError(passwordValidation.errors.join(', '), 'newPassword');
    }

    // Hash new password
    const hashedPassword = await PasswordService.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });
  }

  /**
   * Logout user (invalidate refresh token)
   */
  static async logout(userId: string): Promise<void> {
    // In a production app, you might want to maintain a blacklist of tokens
    // For now, we'll just update the last login time
    await this.updateLastLogin(userId);
  }

  /**
   * Update user's last login timestamp
   */
  private static async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  }
}

