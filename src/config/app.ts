import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { swaggerUI } from '@hono/swagger-ui';
import userRouter from '../routes/userRoutes.js';
import categoryRouter from '../routes/categoryRoutes.js';
import transactionRouter from '../routes/transactionRoutes.js';
import budgetRouter from '../routes/budgetRoutes.js';
import { createOpenAPIDoc } from './swagger.js';

export const createApp = () => {
  const app = new Hono();

  // Middleware
  app.use('*', logger());
  app.use('*', cors());

  // Routes
  app.route('/api/users', userRouter);
  app.route('/api/categories', categoryRouter);
  app.route('/api/transactions', transactionRouter);
  app.route('/api/budgets', budgetRouter);

  // OpenAPI documentation
  const openAPIDoc = createOpenAPIDoc();
  
  // Serve the OpenAPI JSON document
  app.get('/docs', (c) => {
    return c.json(openAPIDoc);
  });

  // Swagger UI - make sure this comes after the /docs endpoint
  app.get('/swagger', swaggerUI({ url: '/docs' }));

  // Health check endpoint
  app.get('/health', (c) => c.json({ status: 'ok' }));

  return app;
};