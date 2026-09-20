import type { Plugin } from 'vite';
import express from 'express';
import { apiRouter } from './apiRouter';

const app = express();
app.use('/api', apiRouter);

export function apiMiddleware(): Plugin {
  return {
    name: 'lovely-eatery-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        (app as unknown as (req: unknown, res: unknown, next: unknown) => void)(req, res, next);
      });
    },
  };
}
