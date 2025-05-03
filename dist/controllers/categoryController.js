import { db } from '../db/index.js';
import { categories } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
// Create a new category
export const createCategory = async (c) => {
    try {
        const user = c.get('user');
        const { name, type } = await c.req.json();
        // Validate type
        if (type !== 'income' && type !== 'expense') {
            return c.json({ error: 'Type must be either "income" or "expense"' }, 400);
        }
        // Create the category
        const newCategory = await db.insert(categories).values({
            name,
            type,
            userId: user.userId,
            createdAt: new Date(),
            updatedAt: new Date()
        }).returning();
        return c.json({
            message: 'Category created successfully',
            category: newCategory[0]
        }, 201);
    }
    catch (error) {
        console.error('Create category error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
// Get all categories for the user
export const getCategories = async (c) => {
    try {
        const user = c.get('user');
        const type = c.req.query('type'); // Optional filter by type
        // Do this:
        let conditions = [eq(categories.userId, user.userId)];
        if (type && (type === 'income' || type === 'expense')) {
            conditions.push(eq(categories.type, type));
        }
        let query = db.select().from(categories).where(and(...conditions));
        const userCategories = await query;
        return c.json({
            categories: userCategories
        });
    }
    catch (error) {
        console.error('Get categories error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
// Get a single category by ID
export const getCategoryById = async (c) => {
    try {
        const user = c.get('user');
        const id = parseInt(c.req.param('id'));
        if (isNaN(id)) {
            return c.json({ error: 'Invalid category ID' }, 400);
        }
        const category = await db.select().from(categories).where(and(eq(categories.id, id), eq(categories.userId, user.userId)));
        if (category.length === 0) {
            return c.json({ error: 'Category not found' }, 404);
        }
        return c.json({
            category: category[0]
        });
    }
    catch (error) {
        console.error('Get category by ID error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
// Update a category
export const updateCategory = async (c) => {
    try {
        const user = c.get('user');
        const id = parseInt(c.req.param('id'));
        const { name, type } = await c.req.json();
        if (isNaN(id)) {
            return c.json({ error: 'Invalid category ID' }, 400);
        }
        // Validate type if provided
        if (type && type !== 'income' && type !== 'expense') {
            return c.json({ error: 'Type must be either "income" or "expense"' }, 400);
        }
        // Check if category exists and belongs to user
        const existingCategory = await db.select().from(categories).where(and(eq(categories.id, id), eq(categories.userId, user.userId)));
        if (existingCategory.length === 0) {
            return c.json({ error: 'Category not found' }, 404);
        }
        // Update the category
        const updatedCategory = await db.update(categories)
            .set({
            name: name || existingCategory[0].name,
            type: type || existingCategory[0].type,
            updatedAt: new Date()
        })
            .where(and(eq(categories.id, id), eq(categories.userId, user.userId)))
            .returning();
        return c.json({
            message: 'Category updated successfully',
            category: updatedCategory[0]
        });
    }
    catch (error) {
        console.error('Update category error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
// Delete a category
export const deleteCategory = async (c) => {
    try {
        const user = c.get('user');
        const id = parseInt(c.req.param('id'));
        if (isNaN(id)) {
            return c.json({ error: 'Invalid category ID' }, 400);
        }
        // Check if category exists and belongs to user
        const existingCategory = await db.select().from(categories).where(and(eq(categories.id, id), eq(categories.userId, user.userId)));
        if (existingCategory.length === 0) {
            return c.json({ error: 'Category not found' }, 404);
        }
        // Delete the category
        await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, user.userId)));
        return c.json({
            message: 'Category deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete category error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
