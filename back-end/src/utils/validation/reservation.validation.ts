import Joi from 'joi';

export const createReservationSchema = Joi.object({
    accommodationId: Joi.string()
        .uuid()
        .required()
        .messages({
            'string.guid': 'Accommodation ID must be a valid UUID',
            'any.required': 'Accommodation ID is required',
        }),

    startDate: Joi.date()
        .iso()
        .min('now')
        .required()
        .messages({
            'date.base': 'Start date must be a valid date',
            'date.min': 'Start date must be in the future',
            'any.required': 'Start date is required',
        }),

    endDate: Joi.date()
        .iso()
        .greater(Joi.ref('startDate'))
        .required()
        .messages({
            'date.base': 'End date must be a valid date',
            'date.greater': 'End date must be after start date',
            'any.required': 'End date is required',
        }),

    guestCount: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
            'number.base': 'Guest count must be a number',
            'number.min': 'Guest count must be at least 1',
            'any.required': 'Guest count is required',
        }),

    tenantMessage: Joi.string()
        .max(1000)
        .optional()
        .allow(null, '')
        .messages({
            'string.max': 'Message must be no more than 1000 characters',
        }),
});

export const updateReservationStatusSchema = Joi.object({
    status: Joi.string()
        .valid('confirmee', 'annulee', 'en_cours', 'terminee')
        .required()
        .messages({
            'any.only': 'Status must be one of: confirmee, annulee, en_cours, terminee',
            'any.required': 'Status is required',
        }),
});

export const cancelReservationSchema = Joi.object({
    cancellationReason: Joi.string()
        .min(10)
        .max(500)
        .required()
        .messages({
            'string.min': 'Cancellation reason must be at least 10 characters',
            'string.max': 'Cancellation reason must be no more than 500 characters',
            'any.required': 'Cancellation reason is required',
        }),
});

export const queryReservationsSchema = Joi.object({
    status: Joi.string()
        .valid('en_attente', 'confirmee', 'annulee', 'en_cours', 'terminee')
        .optional()
        .messages({
            'any.only': 'Status must be one of: en_attente, confirmee, annulee, en_cours, terminee',
        }),

    startDate: Joi.date()
        .iso()
        .optional()
        .messages({
            'date.base': 'Start date must be a valid date',
        }),

    endDate: Joi.date()
        .iso()
        .optional()
        .messages({
            'date.base': 'End date must be a valid date',
        }),

    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .optional()
        .messages({
            'number.base': 'Page must be a number',
            'number.min': 'Page must be at least 1',
        }),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(20)
        .optional()
        .messages({
            'number.base': 'Limit must be a number',
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit must be no more than 100',
        }),

    sortBy: Joi.string()
        .valid('createdAt', 'startDate', 'endDate', 'totalAmount')
        .default('createdAt')
        .optional()
        .messages({
            'any.only': 'Sort by must be one of: createdAt, startDate, endDate, totalAmount',
        }),

    sortOrder: Joi.string()
        .valid('asc', 'desc')
        .default('desc')
        .optional()
        .messages({
            'any.only': 'Sort order must be either asc or desc',
        }),
});
