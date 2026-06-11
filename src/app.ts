import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import userRoutes from './modules/users/users.routes.js';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'Server is running with TypeScript' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo con ts-node-dev en http://localhost:${PORT}`);
});