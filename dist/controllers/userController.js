import bcrypt from 'bcrypt';
import jwt, {} from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
export const register = async (c) => {
    try {
        const { email, password, name } = await c.req.json();
        // Check if user already exists
        const existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length > 0) {
            return c.json({ error: 'User already exists' }, 400);
        }
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Create the user
        const newUser = await db.insert(users).values({
            email,
            password: hashedPassword,
            name,
            createdAt: new Date(),
            updatedAt: new Date()
        }).returning({ id: users.id, email: users.email, name: users.name });
        // Generate JWT token
        const token = jwt.sign({ userId: newUser[0].id, email: newUser[0].email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return c.json({
            message: 'User registered successfully',
            user: {
                id: newUser[0].id,
                email: newUser[0].email,
                name: newUser[0].name
            },
            token
        }, 201);
    }
    catch (error) {
        console.error('Registration error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
export const login = async (c) => {
    try {
        const { email, password } = await c.req.json();
        // Find the user
        const user = await db.select().from(users).where(eq(users.email, email));
        if (user.length === 0) {
            return c.json({ error: 'Invalid credentials' }, 401);
        }
        // Check password
        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
            return c.json({ error: 'Invalid credentials' }, 401);
        }
        const token = jwt.sign({ userId: user[0].id, email: user[0].email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        return c.json({
            message: 'Login successful',
            user: {
                id: user[0].id,
                email: user[0].email,
                name: user[0].name
            },
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
export const getProfile = async (c) => {
    try {
        const user = c.get('user');
        // Get user details from database
        const userDetails = await db.select({
            id: users.id,
            email: users.email,
            name: users.name,
            createdAt: users.createdAt
        }).from(users).where(eq(users.id, user.userId));
        if (userDetails.length === 0) {
            return c.json({ error: 'User not found' }, 404);
        }
        return c.json({
            user: userDetails[0]
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
