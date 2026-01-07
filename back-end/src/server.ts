import express, { Express, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import authRoutes from './routes/auth';
import logementRoutes from './routes/logement/logement.routes';
import disponibiliteRoutes from './routes/disponibilite/disponibilite.routes';
import reservationRoutes from './routes/reservation/reservation.routes';
import messageRoutes from './routes/message';
import paymentRoutes from './routes/payment';

import searchRoutes from './routes/search/search.routes';
import aiRoutes from './routes/ai/ai.routes';

import serviceRoutes from './routes/service';
import pricingRoutes from './routes/pricing';
import favoriRoutes from './routes/favori/favori.routes';

import { apiLogger, errorHandler, swaggerSpec } from './config';

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3333;

// Configure Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
});

// Store connected users
const connectedUsers = new Map<string, string>(); // userId -> socketId

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // User authentication/registration
  socket.on('register', (userId: string) => {
    connectedUsers.set(userId, socket.id);
    socket.join(`user:${userId}`);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Join a reservation room for real-time messaging
  socket.on('join-reservation', (reservationId: string) => {
    socket.join(`reservation:${reservationId}`);
    console.log(`Socket ${socket.id} joined reservation:${reservationId}`);
  });

  // Leave a reservation room
  socket.on('leave-reservation', (reservationId: string) => {
    socket.leave(`reservation:${reservationId}`);
    console.log(`Socket ${socket.id} left reservation:${reservationId}`);
  });

  // Handle new message (broadcast to reservation room and receiver)
  socket.on('send-message', (data: {
    reservationId?: string;
    receiverId: string;
    message: any;
  }) => {
    // Emit to reservation room if available
    if (data.reservationId) {
      socket.to(`reservation:${data.reservationId}`).emit('new-message', data.message);
    }

    // Also emit directly to receiver
    const receiverSocketId = connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('new-message', data.message);
    }
  });

  // Handle typing indicator
  socket.on('typing', (data: { reservationId: string; userId: string }) => {
    socket.to(`reservation:${data.reservationId}`).emit('user-typing', data.userId);
  });

  // Handle stopped typing
  socket.on('stop-typing', (data: { reservationId: string; userId: string }) => {
    socket.to(`reservation:${data.reservationId}`).emit('user-stopped-typing', data.userId);
  });

  // Notify reservation status change
  socket.on('reservation-update', (data: { reservationId: string; status: string; tenantId: string; ownerId: string }) => {
    // Notify both tenant and owner
    const tenantSocketId = connectedUsers.get(data.tenantId);
    const ownerSocketId = connectedUsers.get(data.ownerId);

    if (tenantSocketId) {
      io.to(tenantSocketId).emit('reservation-status-changed', {
        reservationId: data.reservationId,
        status: data.status,
      });
    }

    if (ownerSocketId) {
      io.to(ownerSocketId).emit('reservation-status-changed', {
        reservationId: data.reservationId,
        status: data.status,
      });
    }
  });

  socket.on('disconnect', () => {
    // Remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Make io accessible to routes
app.set('io', io);
app.set('connectedUsers', connectedUsers);

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', {
  skip: (req, res) => false,
  stream: {
    write: (message: string) => {
      return;
    }
  }
}));
app.use(apiLogger);

// Servir les fichiers statiques uploadés
// Servir les fichiers statiques depuis les dossiers uploads
app.use('/uploads', express.static('uploads'));
app.use('/uploads/logements', express.static(path.join(__dirname, '../uploads/logements')));
app.use('/uploads/profiles', express.static(path.join(__dirname, '../uploads/profiles')));

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'BnB ESGI API is running!' });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'BnB ESGI API Documentation',
}));

// Route pour accéder à la spécification JSON
app.get('/api-docs.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Routes
app.use('/auth', authRoutes);
app.use('/logements', logementRoutes);
app.use('/logements', serviceRoutes); // Services routes: /logements/:id/services
app.use('/logements', pricingRoutes); // Pricing routes: /logements/:id/pricing
app.use('/', disponibiliteRoutes); // Includes /logements/:id/availabilities and /availabilities/:id
app.use('/reservations', reservationRoutes);
app.use('/messages', messageRoutes);
app.use('/payments', paymentRoutes);
app.use('/search', searchRoutes);
app.use('/ai', aiRoutes);
app.use('/favoris', favoriRoutes);


app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
  });
});

app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📡 Socket.IO is ready for real-time connections`);
});

export { io };
export default app;
