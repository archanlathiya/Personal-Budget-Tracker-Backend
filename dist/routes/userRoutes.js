import { Hono } from 'hono';
import { register, login, getProfile } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/auth.js';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
const userRouter = new Hono();
// Validation schemas
const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2).optional()
});
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
});
// Routes
userRouter.post('/register', zValidator('json', registerSchema), register);
userRouter.post('/login', zValidator('json', loginSchema), login);
userRouter.get('/profile', authMiddleware, getProfile);
export default userRouter;
