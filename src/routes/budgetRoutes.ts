import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetVsActual
} from '../controllers/budgetController.js';

const budgetRouter = new Hono();

// Apply auth middleware to all budget routes
budgetRouter.use('*', authMiddleware);

// Validation schemas
const createBudgetSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  month: z.number().int().min(1).max(12, 'Month must be between 1 and 12'),
  year: z.number().int().min(2000).max(2100, 'Year must be between 2000 and 2100'),
  categoryId: z.number().int().positive().optional()
});

const updateBudgetSchema = z.object({
  amount: z.number().positive('Amount must be a positive number').optional(),
  month: z.number().int().min(1).max(12, 'Month must be between 1 and 12').optional(),
  year: z.number().int().min(2000).max(2100, 'Year must be between 2000 and 2100').optional(),
  categoryId: z.number().int().positive().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update'
});

// Routes
budgetRouter.post('/', zValidator('json', createBudgetSchema), createBudget);
budgetRouter.get('/', getBudgets);
budgetRouter.get('/vs-actual', getBudgetVsActual);
budgetRouter.get('/:id', getBudgetById);
budgetRouter.put('/:id', zValidator('json', updateBudgetSchema), updateBudget);
budgetRouter.delete('/:id', deleteBudget);

export default budgetRouter;