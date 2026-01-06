import Joi from 'joi';

export const generateAiDescriptionSchema = Joi.object({
    description: Joi.string().required().min(10).max(5000).messages({
        'string.empty': 'Veuillez saisir quelques points clés ou une description brute',
        'string.min': 'Veuillez saisir au moins 10 caractères pour que l\'IA puisse travailler',
        'string.max': 'La description ne peut pas dépasser 5000 caractères',
    }),
});
