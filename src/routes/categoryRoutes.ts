import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController';

const categoryRouter = new Hono();

// Apply auth middleware to all category routes
categoryRouter.use('*', authMiddleware);

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  type: z.enum(['income', 'expense'], { 
    errorMap: () => ({ message: 'Type must be either "income" or "expense"' })
  })
});

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').optional(),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Type must be either "income" or "expense"' })
  }).optional()
}).refine(data => data.name !== undefined || data.type !== undefined, {
  message: 'At least one field must be provided for update'
});

// Routes
categoryRouter.post('/', zValidator('json', createCategorySchema), createCategory);
categoryRouter.get('/', getCategories);
categoryRouter.get('/:id', getCategoryById);
categoryRouter.put('/:id', zValidator('json', updateCategorySchema), updateCategory);
categoryRouter.delete('/:id', deleteCategory);

export default categoryRouter;