import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import serverless from 'serverless-http';
import { config, isRunningInLambda } from './config';
import { prisma } from './prisma';
import todoRouter from './routes/todos';

const app = express();
const prismaReady = prisma.$connect();

app.use(express.json());
app.use(
  cors({
    origin: config.corsOrigins.length ? config.corsOrigins : true,
  }),
);

app.use(async (_req, _res, next) => {
  await prismaReady;
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', environment: config.nodeEnv });
});

app.use('/api/todos', todoRouter);

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ message: 'Unexpected server error' });
});

const startServer = async () => {
  await prismaReady;

  app.listen(config.port, () => {
    console.log(`API ready on http://localhost:${config.port}`);
  });
};

if (!isRunningInLambda) {
  void startServer();
}

export const handler = serverless(app);
export { app };
