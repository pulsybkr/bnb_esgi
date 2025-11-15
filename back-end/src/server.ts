import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import morgan from 'morgan';
import authRoutes from './routes/auth';
import { apiLogger, errorHandler } from './config';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3333;

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

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'BnB ESGI API is running!' });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée',
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export default app;

