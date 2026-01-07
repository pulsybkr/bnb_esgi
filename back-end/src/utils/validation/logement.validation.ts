import Joi from 'joi';

export const createPropertySchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(5)
        .max(200)
        .required()
        .messages({
            'string.empty': 'Title is required',
            'string.min': 'Title must be at least 5 characters long',
            'string.max': 'Title must be no more than 200 characters long',
        }),

    description: Joi.string()
        .trim()
        .min(20)
        .max(5000)
        .optional()
        .allow(null, '')
        .messages({
            'string.min': 'Description must be at least 20 characters long',
            'string.max': 'Description must be no more than 5000 characters long',
        }),

    address: Joi.string()
        .trim()
        .min(5)
        .max(255)
        .required()
        .messages({
            'string.empty': 'Address is required',
            'string.min': 'Address must be at least 5 characters long',
            'string.max': 'Address must be no more than 255 characters long',
        }),

    city: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'City is required',
            'string.min': 'City must be at least 2 characters long',
            'string.max': 'City must be no more than 100 characters long',
        }),

    country: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Country is required',
            'string.min': 'Country must be at least 2 characters long',
            'string.max': 'Country must be no more than 100 characters long',
        }),

    latitude: Joi.number()
        .min(-90)
        .max(90)
        .optional()
        .allow(null)
        .messages({
            'number.min': 'Latitude must be between -90 and 90',
            'number.max': 'Latitude must be between -90 and 90',
        }),

    longitude: Joi.number()
        .min(-180)
        .max(180)
        .optional()
        .allow(null)
        .messages({
            'number.min': 'Longitude must be between -180 and 180',
            'number.max': 'Longitude must be between -180 and 180',
        }),

    type: Joi.string()
        .valid('maison', 'appartement', 'chambre', 'hotel', 'villa', 'studio', 'loft')
        .required()
        .messages({
            'any.only': 'Type must be one of: maison, appartement, chambre, hotel, villa, studio, loft',
            'string.empty': 'Type is required',
        }),

    roomCount: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .required()
        .messages({
            'number.base': 'Room count must be a number',
            'number.min': 'Room count must be at least 1',
            'number.max': 'Room count must be no more than 50',
            'any.required': 'Room count is required',
        }),

    capacity: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .required()
        .messages({
            'number.base': 'Capacity must be a number',
            'number.min': 'Capacity must be at least 1',
            'number.max': 'Capacity must be no more than 100',
            'any.required': 'Capacity is required',
        }),

    pricePerNight: Joi.number()
        .positive()
        .precision(2)
        .required()
        .messages({
            'number.base': 'Price per night must be a number',
            'number.positive': 'Price per night must be positive',
            'any.required': 'Price per night is required',
        }),

    currency: Joi.string()
        .length(3)
        .uppercase()
        .default('XOF')
        .optional()
        .messages({
            'string.length': 'Currency must be a 3-letter code (e.g., XOF, EUR, USD)',
        }),

    amenities: Joi.object()
        .optional()
        .allow(null)
        .messages({
            'object.base': 'Amenities must be a valid JSON object',
        }),

    houseRules: Joi.object()
        .optional()
        .allow(null)
        .messages({
            'object.base': 'House rules must be a valid JSON object',
        }),

    photos: Joi.array()
        .items(
            Joi.object({
                url: Joi.string()
                    .uri()
                    .required()
                    .messages({
                        'string.empty': 'Photo URL is required',
                        'string.uri': 'Photo URL must be a valid URL',
                    }),
                thumbnailUrl: Joi.string()
                    .uri()
                    .optional()
                    .allow(null, '')
                    .messages({
                        'string.uri': 'Thumbnail URL must be a valid URL',
                    }),
                isMain: Joi.boolean()
                    .default(false)
                    .optional()
                    .messages({
                        'boolean.base': 'isMain must be a boolean',
                    }),
                order: Joi.number()
                    .integer()
                    .min(0)
                    .default(0)
                    .optional()
                    .messages({
                        'number.base': 'Order must be a number',
                        'number.min': 'Order must be at least 0',
                    }),
            })
        )
        .optional()
        .messages({
            'array.base': 'Photos must be an array',
        }),

    instantBooking: Joi.boolean()
        .default(false)
        .optional()
        .messages({
            'boolean.base': 'Instant booking must be a boolean',
        }),
});

export const updatePropertySchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(5)
        .max(200)
        .optional()
        .messages({
            'string.min': 'Title must be at least 5 characters long',
            'string.max': 'Title must be no more than 200 characters long',
        }),

    description: Joi.string()
        .trim()
        .min(20)
        .max(5000)
        .optional()
        .allow(null, '')
        .messages({
            'string.min': 'Description must be at least 20 characters long',
            'string.max': 'Description must be no more than 5000 characters long',
        }),

    address: Joi.string()
        .trim()
        .min(5)
        .max(255)
        .optional()
        .messages({
            'string.min': 'Address must be at least 5 characters long',
            'string.max': 'Address must be no more than 255 characters long',
        }),

    city: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .optional()
        .messages({
            'string.min': 'City must be at least 2 characters long',
            'string.max': 'City must be no more than 100 characters long',
        }),

    country: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .optional()
        .messages({
            'string.min': 'Country must be at least 2 characters long',
            'string.max': 'Country must be no more than 100 characters long',
        }),

    latitude: Joi.number()
        .min(-90)
        .max(90)
        .optional()
        .allow(null)
        .messages({
            'number.min': 'Latitude must be between -90 and 90',
            'number.max': 'Latitude must be between -90 and 90',
        }),

    longitude: Joi.number()
        .min(-180)
        .max(180)
        .optional()
        .allow(null)
        .messages({
            'number.min': 'Longitude must be between -180 and 180',
            'number.max': 'Longitude must be between -180 and 180',
        }),

    type: Joi.string()
        .valid('maison', 'appartement', 'chambre', 'hotel', 'villa', 'studio', 'loft')
        .optional()
        .messages({
            'any.only': 'Type must be one of: maison, appartement, chambre, hotel, villa, studio, loft',
        }),

    roomCount: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .optional()
        .messages({
            'number.base': 'Room count must be a number',
            'number.min': 'Room count must be at least 1',
            'number.max': 'Room count must be no more than 50',
        }),

    capacity: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .messages({
            'number.base': 'Capacity must be a number',
            'number.min': 'Capacity must be at least 1',
            'number.max': 'Capacity must be no more than 100',
        }),

    pricePerNight: Joi.number()
        .positive()
        .precision(2)
        .optional()
        .messages({
            'number.base': 'Price per night must be a number',
            'number.positive': 'Price per night must be positive',
        }),

    currency: Joi.string()
        .length(3)
        .uppercase()
        .optional()
        .messages({
            'string.length': 'Currency must be a 3-letter code (e.g., XOF, EUR, USD)',
        }),

    amenities: Joi.object()
        .optional()
        .allow(null)
        .messages({
            'object.base': 'Amenities must be a valid JSON object',
        }),

    houseRules: Joi.object()
        .optional()
        .allow(null)
        .messages({
            'object.base': 'House rules must be a valid JSON object',
        }),

    status: Joi.string()
        .valid('actif', 'suspendu', 'archive')
        .optional()
        .messages({
            'any.only': 'Status must be one of: actif, suspendu, archive',
        }),
});

export const queryPropertiesSchema = Joi.object({
    city: Joi.string()
        .trim()
        .optional()
        .messages({
            'string.base': 'City must be a string',
        }),

    country: Joi.string()
        .trim()
        .optional()
        .messages({
            'string.base': 'Country must be a string',
        }),

    type: Joi.string()
        .valid('maison', 'appartement', 'chambre', 'hotel')
        .optional()
        .messages({
            'any.only': 'Type must be one of: maison, appartement, chambre, hotel',
        }),

    minPrice: Joi.number()
        .positive()
        .optional()
        .messages({
            'number.base': 'Minimum price must be a number',
            'number.positive': 'Minimum price must be positive',
        }),

    maxPrice: Joi.number()
        .positive()
        .optional()
        .messages({
            'number.base': 'Maximum price must be a number',
            'number.positive': 'Maximum price must be positive',
        }),

    minCapacity: Joi.number()
        .integer()
        .min(1)
        .optional()
        .messages({
            'number.base': 'Minimum capacity must be a number',
            'number.min': 'Minimum capacity must be at least 1',
        }),

    status: Joi.string()
        .valid('actif', 'suspendu', 'archive')
        .default('actif')
        .optional()
        .messages({
            'any.only': 'Status must be one of: actif, suspendu, archive',
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
        .valid('createdAt', 'pricePerNight', 'averageRating', 'title')
        .default('createdAt')
        .optional()
        .messages({
            'any.only': 'Sort by must be one of: createdAt, pricePerNight, averageRating, title',
        }),

    sortOrder: Joi.string()
        .valid('asc', 'desc')
        .default('desc')
        .optional()
        .messages({
            'any.only': 'Sort order must be either asc or desc',
        }),
});

export const addPhotoSchema = Joi.object({
    url: Joi.string()
        .uri()
        .required()
        .messages({
            'string.empty': 'Photo URL is required',
            'string.uri': 'Photo URL must be a valid URL',
        }),

    thumbnailUrl: Joi.string()
        .uri()
        .optional()
        .allow(null, '')
        .messages({
            'string.uri': 'Thumbnail URL must be a valid URL',
        }),

    isMain: Joi.boolean()
        .default(false)
        .optional()
        .messages({
            'boolean.base': 'isMain must be a boolean',
        }),

    order: Joi.number()
        .integer()
        .min(0)
        .default(0)
        .optional()
        .messages({
            'number.base': 'Order must be a number',
            'number.min': 'Order must be at least 0',
        }),
});
