import { db } from '../db/index.js';
import { transactions, categories } from '../db/schema.js';
import { eq, and, desc, sql, asc, between, gte, lte } from 'drizzle-orm';
// Create a new transaction
export const createTransaction = async (c) => {
    try {
        const user = c.get('user');
        const { amount, description, date, type, categoryId } = await c.req.json();
        // Validate type
        if (type !== 'income' && type !== 'expense') {
            return c.json({ error: 'Type must be either "income" or "expense"' }, 400);
        }
        // Validate amount
        if (isNaN(Number(amount)) || Number(amount) <= 0) {
            return c.json({ error: 'Amount must be a positive number' }, 400);
        }
        // Validate date
        const transactionDate = new Date(date);
        if (isNaN(transactionDate.getTime())) {
            return c.json({ error: 'Invalid date format' }, 400);
        }
        // Validate category if provided
        if (categoryId) {
            const category = await db.select().from(categories).where(and(eq(categories.id, categoryId), eq(categories.userId, user.userId), eq(categories.type, type)));
            if (category.length === 0) {
                return c.json({ error: 'Category not found or does not match transaction type' }, 400);
            }
        }
        // Create the transaction
        const newTransaction = await db.insert(transactions).values({
            amount,
            description,
            date: transactionDate,
            type,
            categoryId,
            userId: user.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        }).returning();
        return c.json({
            message: 'Transaction created successfully',
            transaction: newTransaction[0]
        }, 201);
    }
    catch (error) {
        console.error('Create transaction error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
// Get all transactions for the user with filtering and pagination
export const getTransactions = async (c) => {
    try {
        const user = c.get('user');
        // Parse query parameters
        const type = c.req.query('type'); // 'income' or 'expense'
        const categoryId = c.req.query('categoryId') ? parseInt(c.req.query('categoryId')) : undefined;
        const startDate = c.req.query('startDate') ? new Date(c.req.query('startDate')) : undefined;
        const endDate = c.req.query('endDate') ? new Date(c.req.query('endDate')) : undefined;
        const minAmount = c.req.query('minAmount') ? parseFloat(c.req.query('minAmount')) : undefined;
        const maxAmount = c.req.query('maxAmount') ? parseFloat(c.req.query('maxAmount')) : undefined;
        const page = c.req.query('page') ? parseInt(c.req.query('page')) : 1;
        const limit = c.req.query('limit') ? parseInt(c.req.query('limit')) : 10;
        const sortBy = c.req.query('sortBy') || 'date';
        const sortOrder = c.req.query('sortOrder') || 'desc';
        // Validate pagination parameters
        if (isNaN(page) || page < 1) {
            return c.json({ error: 'Invalid page number' }, 400);
        }
        if (isNaN(limit) || limit < 1 || limit > 100) {
            return c.json({ error: 'Invalid limit (must be between 1 and 100)' }, 400);
        }
        // Calculate offset
        const offset = (page - 1) * limit;
        // Build query conditions
        let conditions = [eq(transactions.userId, user.userId)];
        if (type && (type === 'income' || type === 'expense')) {
            conditions.push(eq(transactions.type, type));
        }
        if (categoryId && !isNaN(categoryId)) {
            conditions.push(eq(transactions.categoryId, categoryId));
        }
        if (startDate && !isNaN(startDate.getTime()) && endDate && !isNaN(endDate.getTime())) {
            conditions.push(between(transactions.date, startDate, endDate));
        }
        else if (startDate && !isNaN(startDate.getTime())) {
            conditions.push(gte(transactions.date, startDate));
        }
        else if (endDate && !isNaN(endDate.getTime())) {
            conditions.push(lte(transactions.date, endDate));
        }
        if (minAmount && !isNaN(minAmount)) {
            conditions.push(gte(transactions.amount, String(minAmount)));
        }
        if (maxAmount && !isNaN(maxAmount)) {
            conditions.push(lte(transactions.amount, String(maxAmount)));
        }
        // Determine sort column and order
        let orderBy;
        if (sortBy === 'amount') {
            orderBy = sortOrder === 'asc' ? asc(transactions.amount) : desc(transactions.amount);
        }
        else if (sortBy === 'date') {
            orderBy = sortOrder === 'asc' ? asc(transactions.date) : desc(transactions.date);
        }
        else {
            orderBy = desc(transactions.date); // Default sort
        }
        // Get total count for pagination
        const countResult = await db
            .select({ count: sql `count(*)` })
            .from(transactions)
            .where(and(...conditions));
        const totalCount = Number(countResult[0].count);
        const totalPages = Math.ceil(totalCount / limit);
        // Get transactions with pagination and sorting
        const userTransactions = await db
            .select()
            .from(transactions)
            .where(and(...conditions))
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);
        return c.json({
            transactions: userTransactions,
            pagination: {
                total: totalCount,
                page,
                limit,
                totalPages
            }
        });
    }
    catch (error) {
        console.error('Get transactions error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
// Get a single transaction by ID
export const getTransactionById = async (c) => {
    try {
        const user = c.get('user');
        const id = parseInt(c.req.param('id'));
        if (isNaN(id)) {
            return c.json({ error: 'Invalid transaction ID' }, 400);
        }
        const transaction = await db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, user.userId)));
        if (transaction.length === 0) {
            return c.json({ error: 'Transaction not found' }, 404);
        }
        return c.json({
            transaction: transaction[0]
        });
    }
    catch (error) {
        console.error('Get transaction by ID error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
// Update a transaction
export const updateTransaction = async (c) => {
    try {
        const user = c.get('user');
        const id = parseInt(c.req.param('id'));
        const { amount, description, date, type, categoryId } = await c.req.json();
        if (isNaN(id)) {
            return c.json({ error: 'Invalid transaction ID' }, 400);
        }
        // Check if transaction exists and belongs to user
        const existingTransaction = await db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, user.userId)));
        if (existingTransaction.length === 0) {
            return c.json({ error: 'Transaction not found' }, 404);
        }
        // Validate type if provided
        if (type && type !== 'income' && type !== 'expense') {
            return c.json({ error: 'Type must be either "income" or "expense"' }, 400);
        }
        // Validate amount if provided
        if (amount && (isNaN(Number(amount)) || Number(amount) <= 0)) {
            return c.json({ error: 'Amount must be a positive number' }, 400);
        }
        // Validate date if provided
        let transactionDate = existingTransaction[0].date;
        if (date) {
            transactionDate = new Date(date);
            if (isNaN(transactionDate.getTime())) {
                return c.json({ error: 'Invalid date format' }, 400);
            }
        }
        // Validate category if provided
        if (categoryId) {
            const transactionType = type || existingTransaction[0].type;
            const category = await db.select().from(categories).where(and(eq(categories.id, categoryId), eq(categories.userId, user.userId), eq(categories.type, transactionType)));
            if (category.length === 0) {
                return c.json({ error: 'Category not found or does not match transaction type' }, 400);
            }
        }
        // Update the transaction
        const updatedTransaction = await db.update(transactions)
            .set({
            amount: amount || existingTransaction[0].amount,
            description: description !== undefined ? description : existingTransaction[0].description,
            date: transactionDate,
            type: type || existingTransaction[0].type,
            categoryId: categoryId !== undefined ? categoryId : existingTransaction[0].categoryId,
            updatedAt: new Date()
        })
            .where(and(eq(transactions.id, id), eq(transactions.userId, user.userId)))
            .returning();
        return c.json({
            message: 'Transaction updated successfully',
            transaction: updatedTransaction[0]
        });
    }
    catch (error) {
        console.error('Update transaction error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
// Delete a transaction
export const deleteTransaction = async (c) => {
    try {
        const user = c.get('user');
        const id = parseInt(c.req.param('id'));
        if (isNaN(id)) {
            return c.json({ error: 'Invalid transaction ID' }, 400);
        }
        // Check if transaction exists and belongs to user
        const existingTransaction = await db.select().from(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, user.userId)));
        if (existingTransaction.length === 0) {
            return c.json({ error: 'Transaction not found' }, 404);
        }
        // Delete the transaction
        await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, user.userId)));
        return c.json({
            message: 'Transaction deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete transaction error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
// Get transaction summary (total income, total expenses, balance)
export const getTransactionSummary = async (c) => {
    try {
        const user = c.get('user');
        // Parse query parameters for date range
        const startDate = c.req.query('startDate') ? new Date(c.req.query('startDate')) : undefined;
        const endDate = c.req.query('endDate') ? new Date(c.req.query('endDate')) : undefined;
        // Build query conditions
        let conditions = [eq(transactions.userId, user.userId)];
        if (startDate && !isNaN(startDate.getTime()) && endDate && !isNaN(endDate.getTime())) {
            conditions.push(between(transactions.date, startDate, endDate));
        }
        else if (startDate && !isNaN(startDate.getTime())) {
            conditions.push(gte(transactions.date, startDate));
        }
        else if (endDate && !isNaN(endDate.getTime())) {
            conditions.push(lte(transactions.date, endDate));
        }
        // Get total income
        const incomeResult = await db
            .select({ total: sql `COALESCE(SUM(amount), 0)` })
            .from(transactions)
            .where(and(...conditions, eq(transactions.type, 'income')));
        // Get total expenses
        const expenseResult = await db
            .select({ total: sql `COALESCE(SUM(amount), 0)` })
            .from(transactions)
            .where(and(...conditions, eq(transactions.type, 'expense')));
        const totalIncome = Number(incomeResult[0].total);
        const totalExpense = Number(expenseResult[0].total);
        const balance = totalIncome - totalExpense;
        return c.json({
            summary: {
                totalIncome,
                totalExpense,
                balance,
                period: {
                    startDate: startDate || 'all time',
                    endDate: endDate || 'all time'
                }
            }
        });
    }
    catch (error) {
        console.error('Get transaction summary error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
