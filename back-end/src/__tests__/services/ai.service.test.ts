const mockGenerateContent = jest.fn();

// Mock the GoogleGenerativeAI BEFORE requiring the service
jest.mock('@google/generative-ai', () => ({
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockImplementation(() => ({
            generateContent: mockGenerateContent
        }))
    }))
}));

process.env.GEMINI_API_KEY = 'fake-key';
// Use require to ensure it loads AFTER the env var and mock are set
const { AiService } = require('../../services/ai.service');

describe('AiService', () => {
    let aiService: any;

    beforeEach(() => {
        aiService = new AiService();
        jest.clearAllMocks();
    });

    describe('generateDescription', () => {
        it('should return generated text on success', async () => {
            const mockResponse = {
                response: {
                    text: () => 'This is a beautiful villa in Dakar.'
                }
            };
            mockGenerateContent.mockResolvedValue(mockResponse);

            const result = await aiService.generateDescription({ description: 'Villa in Dakar with pool' });

            expect(result).toBe('This is a beautiful villa in Dakar.');
            expect(mockGenerateContent).toHaveBeenCalled();
        });

        it('should throw an error if AI fails', async () => {
            mockGenerateContent.mockRejectedValue(new Error('API Error'));

            await expect(aiService.generateDescription({ description: 'test' }))
                .rejects.toThrow('Erreur lors de la génération de la description par l\'IA.');
        });
    });
});
