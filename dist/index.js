import { serve } from '@hono/node-server';
import dotenv from 'dotenv';
import { createApp } from './config/app.js';
dotenv.config();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const app = createApp();
// Start the server
serve({
    fetch: app.fetch,
    port: PORT,
});
console.log(`Server is running on http://localhost:${PORT}`);
console.log(`Swagger UI is available at http://localhost:${PORT}/swagger`);
console.log(`API documentation is available at http://localhost:${PORT}/docs`);
