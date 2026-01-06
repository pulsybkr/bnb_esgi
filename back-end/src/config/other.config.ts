import { Request, Response, NextFunction } from 'express';

export const apiLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    // Log request
    console.log(`📨 [${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log(`   From: ${req.ip} (${req.get('User-Agent')?.substring(0, 50)}...)`);

    if (req.body && Object.keys(req.body).length > 0) {
        console.log(`   Body: ${JSON.stringify(req.body).substring(0, 200)}...`);
    }

    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`📤 [${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });

    next();
};

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
    console.error('❌ Error:', error);

    if (error.name === 'AuthenticationError') {
        return res.status(401).json({
            success: false,
            message: error.message,
            type: 'authentication_error',
        });
    }

    if (error.name === 'AuthorizationError') {
        return res.status(403).json({
            success: false,
            message: error.message,
            type: 'authorization_error',
        });
    }

    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: error.message,
            type: 'validation_error',
            field: error.field,
            ...(error as any).details && { details: (error as any).details },
        });
    }

    // Gérer les erreurs Prisma (base de données)
    if (error.code === 'P1001' || error.message?.includes("Can't reach database server")) {
        return res.status(503).json({
            success: false,
            message: 'La base de données n\'est pas accessible. Veuillez démarrer PostgreSQL.',
            type: 'database_error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }

    if (error.code?.startsWith('P')) {
        // Autre erreur Prisma
        return res.status(500).json({
            success: false,
            message: 'Erreur de base de données',
            type: 'database_error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }

    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        type: 'internal_error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
};