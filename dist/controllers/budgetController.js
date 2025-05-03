import { db } from '../db/index.js';
import { budgets, categories } from '../db/schema.js';
import { eq, and, sql, between, not } from 'drizzle-orm';
// Create a new budget
export const createBudget = async (c) => {
    try {
        const user = c.get('user');
        const { amount, month, year, categoryId } = await c.req.json();
        // Validate amount
        if (isNaN(Number(amount)) || Number(amount) <= 0) {
            return c.json({ error: 'Amount must be a positive number' }, 400);
        }
        // Validate month
        if (isNaN(Number(month)) || Number(month) < 1 || Number(month) > 12) {
            return c.json({ error: 'Month must be between 1 and 12' }, 400);
        }
        // Validate year
        if (isNaN(Number(year)) || Number(year) < 2000 || Number(year) > 2100) {
            return c.json({ error: 'Year must be between 2000 and 2100' }, 400);
        }
        // Validate category if provided
        if (categoryId) {
            const category = await db.select().from(categories).where(and(eq(categories.id, categoryId), eq(categories.userId, user.userId), eq(categories.type, 'expense') // Budgets are typically for expenses
            ));
            if (category.length === 0) {
                return c.json({ error: 'Category not found or is not an expense category' }, 400);
            }
        }
        // Check if budget already exists for this month/year/category
        if (categoryId) {
            const existingBudget = await db.select().from(budgets).where(and(eq(budgets.userId, user.userId), eq(budgets.month, month), eq(budgets.year, year), eq(budgets.categoryId, categoryId)));
            if (existingBudget.length > 0) {
                return c.json({ error: 'Budget already exists for this category in the selected month/year' }, 400);
            }
        }
        // Create the budget
        const newBudget = await db.insert(budgets).values({
            amount,
            month,
            year,
            categoryId,
            userId: user.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        }).returning();
        return c.json({
            message: 'Budget created successfully',
            budget: newBudget[0]
        }, 201);
    }
    catch (error) {
        console.error('Create budget error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
// Get all budgets for the user
export const getBudgets = async (c) => {
    try {
        const user = c.get('user');
        // Parse query parameters
        const month = c.req.query('month') ? parseInt(c.req.query('month')) : undefined;
        const year = c.req.query('year') ? parseInt(c.req.query('year')) : undefined;
        const categoryId = c.req.query('categoryId') ? parseInt(c.req.query('categoryId')) : undefined;
        // Build query conditions
        let conditions = [eq(budgets.userId, user.userId)];
        if (month && !isNaN(month) && month >= 1 && month <= 12) {
            conditions.push(eq(budgets.month, month));
        }
        if (year && !isNaN(year)) {
            conditions.push(eq(budgets.year, year));
        }
        if (categoryId && !isNaN(categoryId)) {
            conditions.push(eq(budgets.categoryId, categoryId));
        }
        // Get budgets
        const userBudgets = await db.select().from(budgets).where(and(...conditions));
        return c.json({
            budgets: userBudgets
        });
    }
    catch (error) {
        console.error('Get budgets error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
// Get a single budget by ID
export const getBudgetById = async (c) => {
    try {
        const user = c.get('user');
        const id = parseInt(c.req.param('id'));
        if (isNaN(id)) {
            return c.json({ error: 'Invalid budget ID' }, 400);
        }
        const budget = await db.select().from(budgets).where(and(eq(budgets.id, id), eq(budgets.userId, user.userId)));
        if (budget.length === 0) {
            return c.json({ error: 'Budget not found' }, 404);
        }
        return c.json({
            budget: budget[0]
        });
    }
    catch (error) {
        console.error('Get budget by ID error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
// Update a budget
export const updateBudget = async (c) => {
    try {
        const user = c.get('user');
        const id = parseInt(c.req.param('id'));
        const { amount, month, year, categoryId } = await c.req.json();
        if (isNaN(id)) {
            return c.json({ error: 'Invalid budget ID' }, 400);
        }
        // Check if budget exists and belongs to user
        const existingBudget = await db.select().from(budgets).where(and(eq(budgets.id, id), eq(budgets.userId, user.userId)));
        if (existingBudget.length === 0) {
            return c.json({ error: 'Budget not found' }, 404);
        }
        // Validate amount if provided
        if (amount && (isNaN(Number(amount)) || Number(amount) <= 0)) {
            return c.json({ error: 'Amount must be a positive number' }, 400);
        }
        // Validate month if provided
        if (month && (isNaN(Number(month)) || Number(month) < 1 || Number(month) > 12)) {
            return c.json({ error: 'Month must be between 1 and 12' }, 400);
        }
        // Validate year if provided
        if (year && (isNaN(Number(year)) || Number(year) < 2000 || Number(year) > 2100)) {
            return c.json({ error: 'Year must be between 2000 and 2100' }, 400);
        }
        // Validate category if provided
        if (categoryId) {
            const category = await db.select().from(categories).where(and(eq(categories.id, categoryId), eq(categories.userId, user.userId), eq(categories.type, 'expense')));
            if (category.length === 0) {
                return c.json({ error: 'Category not found or is not an expense category' }, 400);
            }
        }
        // Check for duplicate if changing month/year/category
        if ((month && month !== existingBudget[0].month) ||
            (year && year !== existingBudget[0].year) ||
            (categoryId && categoryId !== existingBudget[0].categoryId)) {
            const newMonth = month || existingBudget[0].month;
            const newYear = year || existingBudget[0].year;
            const newCategoryId = categoryId || existingBudget[0].categoryId;
            const duplicateBudget = await db.select().from(budgets).where(and(eq(budgets.userId, user.userId), eq(budgets.month, newMonth), eq(budgets.year, newYear), eq(budgets.categoryId, newCategoryId), not(eq(budgets.id, id)) // Not the current budget
            ));
            if (duplicateBudget.length > 0) {
                return c.json({ error: 'Budget already exists for this category in the selected month/year' }, 400);
            }
        }
        // Update the budget
        const updatedBudget = await db.update(budgets)
            .set({
            amount: amount || existingBudget[0].amount,
            month: month || existingBudget[0].month,
            year: year || existingBudget[0].year,
            categoryId: categoryId || existingBudget[0].categoryId,
            updatedAt: new Date()
        })
            .where(and(eq(budgets.id, id), eq(budgets.userId, user.userId)))
            .returning();
        return c.json({
            message: 'Budget updated successfully',
            budget: updatedBudget[0]
        });
    }
    catch (error) {
        console.error('Update budget error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
// Delete a budget
export const deleteBudget = async (c) => {
    try {
        const user = c.get('user');
        const id = parseInt(c.req.param('id'));
        if (isNaN(id)) {
            return c.json({ error: 'Invalid budget ID' }, 400);
        }
        // Check if budget exists and belongs to user
        const existingBudget = await db.select().from(budgets).where(and(eq(budgets.id, id), eq(budgets.userId, user.userId)));
        if (existingBudget.length === 0) {
            return c.json({ error: 'Budget not found' }, 404);
        }
        // Delete the budget
        await db.delete(budgets).where(and(eq(budgets.id, id), eq(budgets.userId, user.userId)));
        return c.json({
            message: 'Budget deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete budget error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
// Get budget vs actual spending
export const getBudgetVsActual = async (c) => {
    try {
        const user = c.get('user');
        // Parse query parameters
        const month = c.req.query('month') ? parseInt(c.req.query('month')) : new Date().getMonth() + 1;
        const year = c.req.query('year') ? parseInt(c.req.query('year')) : new Date().getFullYear();
        if (isNaN(month) || month < 1 || month > 12) {
            return c.json({ error: 'Month must be between 1 and 12' }, 400);
        }
        if (isNaN(year) || year < 2000 || year > 2100) {
            return c.json({ error: 'Year must be between 2000 and 2100' }, 400);
        }
        // Get all budgets for the month/year
        const userBudgets = await db.select().from(budgets)
            .where(and(eq(budgets.userId, user.userId), eq(budgets.month, month), eq(budgets.year, year)));
        // Calculate start and end date for the month
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        // Get all expense transactions for the month grouped by category
        const expensesByCategory = await db.execute(sql `
      SELECT 
        category_id, 
        COALESCE(SUM(amount), 0) as total_spent
      FROM transactions
      WHERE 
        user_id = ${user.userId} AND
        type = 'expense' AND
        date >= ${startDate} AND
        date <= ${endDate} AND
        category_id IS NOT NULL
      GROUP BY category_id
    `);
        // Convert to a map for easier lookup
        const expenseMap = {};
        for (const expense of expensesByCategory) {
            expenseMap[String(expense.category_id)] = Number(expense.total_spent);
        }
        // Calculate total budget and total spent
        let totalBudget = 0;
        let totalSpent = 0;
        // Combine budget and actual data
        const budgetVsActual = userBudgets.map(budget => {
            const spent = expenseMap[String(budget.categoryId)] || 0;
            totalBudget += Number(budget.amount);
            totalSpent += spent;
            return {
                budgetId: budget.id,
                categoryId: budget.categoryId,
                budgetAmount: Number(budget.amount),
                actualAmount: spent,
                difference: Number(budget.amount) - spent,
                percentUsed: spent / Number(budget.amount) * 100
            };
        });
        return c.json({
            month,
            year,
            totalBudget,
            totalSpent,
            remaining: totalBudget - totalSpent,
            percentUsed: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
            categories: budgetVsActual
        });
    }
    catch (error) {
        console.error('Get budget vs actual error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
