export const authConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m', // 15 minutes
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d', // 7 days
  },

  password: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
    minLength: 8,
    maxLength: 128,
  },

  // Cookie Configuration
  cookies: {
    accessToken: {
      name: 'accessToken',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 15 * 60 * 1000, // 15 minutes
    },
    refreshToken: {
      name: 'refreshToken',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  },

  // Rate limiting
  rateLimit: {
    loginAttempts: parseInt(process.env.LOGIN_RATE_LIMIT || '5'), // attempts per window
    windowMs: parseInt(process.env.LOGIN_WINDOW_MS || '900000'), // 15 minutes
  },

  // Email verification
  emailVerification: {
    required: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
    tokenExpiry: process.env.EMAIL_VERIFICATION_EXPIRY || '24h', // 24 hours
  },
};

