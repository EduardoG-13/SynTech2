/**
 * app.js - Configuração do Express (middlewares e rotas).
 * Separado do server.js para facilitar testes futuros.
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { Request, Response } from 'express';

const app = express();
const projectRoot = process.cwd();

// --------------- Middlewares ---------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Service Worker servido na raiz para escopo global do PWA
app.get('/sw.js', (_req: Request, res: Response) => {
  res.sendFile(path.join(projectRoot, 'src/public/sw.js'));
});

// --------------- Rotas ---------------
import routes from './routes/index';
app.use('/api', routes);

export default app;
