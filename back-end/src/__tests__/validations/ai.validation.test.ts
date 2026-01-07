import { generateAiDescriptionSchema } from '../../utils/validation/ai.validation';

describe('AI Validation', () => {
    describe('generateAiDescriptionSchema', () => {
        it('should validate a correct description', () => {
            const { error } = generateAiDescriptionSchema.validate({ description: 'This is a valid description for the AI to work with.' });
            expect(error).toBeUndefined();
        });

        it('should fail if description is too short', () => {
            const { error } = generateAiDescriptionSchema.validate({ description: 'Too short' });
            expect(error).toBeDefined();
            expect(error?.details[0].message).toBe("Veuillez saisir au moins 10 caractères pour que l'IA puisse travailler");
        });

        it('should fail if description is empty', () => {
            const { error } = generateAiDescriptionSchema.validate({ description: '' });
            expect(error).toBeDefined();
        });

        it('should fail if description is missing', () => {
            const { error } = generateAiDescriptionSchema.validate({});
            expect(error).toBeDefined();
        });
    });
});
