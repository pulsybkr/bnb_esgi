import Joi from 'joi';

export const registerSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 1 character long',
      'string.max': 'First name must be no more than 50 characters long',
    }),

  lastName: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 1 character long',
      'string.max': 'Last name must be no more than 50 characters long',
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must be no more than 128 characters long',
      'string.empty': 'Password is required',
    }),

  phone: Joi.string()
    .pattern(/^(\+?[1-9]\d{1,14}|0\d{9})$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),

  userType: Joi.string()
    .valid('locataire', 'proprietaire', 'admin')
    .required()
    .messages({
      'any.only': 'User type must be one of: locataire, proprietaire, admin',
      'string.empty': 'User type is required',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
    }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'string.empty': 'Refresh token is required',
    }),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Current password is required',
    }),

  newPassword: Joi.string()
    .min(8)
    .max(128)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.max': 'New password must be no more than 128 characters long',
      'string.empty': 'New password is required',
    }),
});

export const requestPasswordResetSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
    }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': 'Reset token is required',
    }),

  newPassword: Joi.string()
    .min(8)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must be no more than 128 characters long',
      'string.empty': 'Password is required',
    }),
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'string.empty': 'Verification token is required',
    }),
});

