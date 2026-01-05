import bcrypt from 'bcryptjs';
import { authConfig } from '../../config';

export class PasswordService {
  /**
   * Hash a plain text password
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(authConfig.password.saltRounds);
      return await bcrypt.hash(password, salt);
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify a plain text password against a hashed password
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      throw new Error('Failed to verify password');
    }
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < authConfig.password.minLength) {
      errors.push(`Password must be at least ${authConfig.password.minLength} characters long`);
    }

    if (password.length > authConfig.password.maxLength) {
      errors.push(`Password must be no more than ${authConfig.password.maxLength} characters long`);
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Check for at least one digit
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one digit');
    }

    // Check for at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check for common weak passwords (basic check)
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common, please choose a stronger password');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check if password has been compromised (basic implementation)
   * In production, you might want to use services like HaveIBeenPwned API
   */
  static async checkPasswordCompromised(password: string): Promise<boolean> {
    // This is a basic implementation. In production, consider using:
    // - HaveIBeenPwned API (https://haveibeenpwned.com/API/v3)
    // - Local password blacklist

    const compromisedPasswords = [
      'password123',
      '123456789',
      'qwerty123',
      // Add more compromised passwords or integrate with external service
    ];

    return compromisedPasswords.includes(password.toLowerCase());
  }

  /**
   * Generate a secure random password
   */
  static generateSecurePassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = lowercase + uppercase + digits + special;
    let password = '';

    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += digits[Math.floor(Math.random() * digits.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Check if password needs rehashing (for migration purposes)
   */
  static needsRehash(hashedPassword: string): boolean {
    try {
      // bcrypt hashes start with $2a$, $2b$, or $2y$
      // We can check if it was hashed with current salt rounds
      const saltRounds = parseInt(hashedPassword.split('$')[2]);
      return saltRounds < authConfig.password.saltRounds;
    } catch {
      return true; // If parsing fails, assume it needs rehashing
    }
  }
}

