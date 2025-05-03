import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.js';
import { createTransaction, getTransactions, getTransactionById, updateTransaction, deleteTransaction, getTransactionSummary } from '../controllers/transactionController.js';
const transactionRouter = new Hono();
// Apply auth middleware to all transaction routes
transactionRouter.use('*', authMiddleware);
// Validation schemas
const createTransactionSchema = z.object({
    amount: z.number().positive('Amount must be a positive number'),
    description: z.string().optional(),
    date: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
        message: 'Invalid date format'
    }),
    type: z.enum(['income', 'expense'], {
        errorMap: () => ({ message: 'Type must be either "income" or "expense"' })
    }),
    categoryId: z.number().int().positive().optional()
});
const updateTransactionSchema = z.object({
    amount: z.number().positive('Amount must be a positive number').optional(),
    description: z.string().optional().nullable(),
    date: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
        message: 'Invalid date format'
    }).optional(),
    type: z.enum(['income', 'expense'], {
        errorMap: () => ({ message: 'Type must be either "income" or "expense"' })
    }).optional(),
    categoryId: z.number().int().positive().optional().nullable()
}).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update'
});
// Routes
transactionRouter.post('/', zValidator('json', createTransactionSchema), createTransaction);
transactionRouter.get('/', getTransactions);
transactionRouter.get('/summary', getTransactionSummary);
transactionRouter.get('/:id', getTransactionById);
transactionRouter.put('/:id', zValidator('json', updateTransactionSchema), updateTransaction);
transactionRouter.delete('/:id', deleteTransaction);
export default transactionRouter;
