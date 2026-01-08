import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BnB ESGI API',
            version: '1.0.0',
            description: 'API REST pour la plateforme BnB ESGI - Gestion des réservations et authentification',
            contact: {
                name: 'BnB ESGI Team',
            },
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3333',
                description: 'Serveur de développement',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Entrez votre token JWT (sans le préfixe "Bearer")',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                            example: 'Une erreur est survenue',
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: 'clx1234567890',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'user@example.com',
                        },
                        firstName: {
                            type: 'string',
                            example: 'John',
                        },
                        lastName: {
                            type: 'string',
                            example: 'Doe',
                        },
                        userType: {
                            type: 'string',
                            enum: ['locataire', 'proprietaire', 'admin'],
                            example: 'locataire',
                        },
                        emailVerified: {
                            type: 'boolean',
                            example: false,
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Auth',
                description: 'Endpoints d\'authentification et gestion des utilisateurs',
            },
            {
                name: 'Verification',
                description: 'Vérification d\'identité des utilisateurs',
            },
            {
                name: 'Notifications',
                description: 'Gestion des notifications push',
            },
            {
                name: 'Admin - Verifications',
                description: 'Gestion admin des vérifications d\'identité',
            },
            {
                name: 'Admin - Moderation',
                description: 'Modération des annonces, utilisateurs et signalements',
            },
            {
                name: 'Admin - Analytics',
                description: 'Statistiques et analytics de la plateforme',
            },
            {
                name: 'Admin - Reporting',
                description: 'Génération et export de rapports',
            },
        ],
    },
    apis: [
        './src/routes/**/*.ts',
        './src/controllers/**/*.ts',
    ], // Chemins vers les fichiers contenant les annotations
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
