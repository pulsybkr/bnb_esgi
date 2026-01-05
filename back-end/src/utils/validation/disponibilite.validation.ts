import Joi from 'joi';

export const createAvailabilitySchema = Joi.object({
    startDate: Joi.date()
        .iso()
        .required()
        .messages({
            'date.base': 'Start date must be a valid date',
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

    status: Joi.string()
        .valid('disponible', 'reserve', 'bloque')
        .default('disponible')
        .optional()
        .messages({
            'any.only': 'Status must be one of: disponible, reserve, bloque',
        }),

    customPrice: Joi.number()
        .positive()
        .precision(2)
        .optional()
        .allow(null)
        .messages({
            'number.base': 'Custom price must be a number',
            'number.positive': 'Custom price must be positive',
        }),

    note: Joi.string()
        .max(500)
        .optional()
        .allow(null, '')
        .messages({
            'string.max': 'Note must be no more than 500 characters',
        }),
});

export const updateAvailabilitySchema = Joi.object({
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

    status: Joi.string()
        .valid('disponible', 'reserve', 'bloque')
        .optional()
        .messages({
            'any.only': 'Status must be one of: disponible, reserve, bloque',
        }),

    customPrice: Joi.number()
        .positive()
        .precision(2)
        .optional()
        .allow(null)
        .messages({
            'number.base': 'Custom price must be a number',
            'number.positive': 'Custom price must be positive',
        }),

    note: Joi.string()
        .max(500)
        .optional()
        .allow(null, '')
        .messages({
            'string.max': 'Note must be no more than 500 characters',
        }),
});

export const queryAvailabilitiesSchema = Joi.object({
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

    status: Joi.string()
        .valid('disponible', 'reserve', 'bloque')
        .optional()
        .messages({
            'any.only': 'Status must be one of: disponible, reserve, bloque',
        }),
});

export const bulkCreateAvailabilitiesSchema = Joi.object({
    periods: Joi.array()
        .items(
            Joi.object({
                startDate: Joi.date().iso().required(),
                endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
                status: Joi.string().valid('disponible', 'reserve', 'bloque').default('disponible').optional(),
                customPrice: Joi.number().positive().precision(2).optional().allow(null),
                note: Joi.string().max(500).optional().allow(null, ''),
            })
        )
        .min(1)
        .required()
        .messages({
            'array.min': 'At least one period is required',
            'any.required': 'Periods array is required',
        }),
});
