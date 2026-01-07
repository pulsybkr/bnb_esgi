import Joi from 'joi';

export const sendMessageSchema = Joi.object({
    receiverId: Joi.string()
        .uuid()
        .required()
        .messages({
            'string.guid': 'Receiver ID must be a valid UUID',
            'any.required': 'Receiver ID is required',
        }),

    content: Joi.string()
        .min(1)
        .max(2000)
        .required()
        .messages({
            'string.empty': 'Message content cannot be empty',
            'string.min': 'Message must be at least 1 character',
            'string.max': 'Message must be no more than 2000 characters',
            'any.required': 'Message content is required',
        }),

    reservationId: Joi.string()
        .uuid()
        .optional()
        .allow(null, '')
        .messages({
            'string.guid': 'Reservation ID must be a valid UUID',
        }),

    type: Joi.string()
        .valid('reservation', 'support', 'general')
        .optional()
        .default('general')
        .messages({
            'any.only': 'Type must be one of: reservation, support, general',
        }),
});

