import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
export const authMiddleware = async (c, next) => {
    try {
        // Get the authorization header
        const authHeader = c.req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return c.json({ error: 'Unauthorized - No token provided' }, 401);
        }
        // Extract the token
        const token = authHeader.split(' ')[1];
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        // Add the user info to the context
        c.set('user', decoded);
        // Continue to the next middleware or route handler
        await next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return c.json({ error: 'Unauthorized - Invalid token' }, 401);
        }
        if (error instanceof jwt.TokenExpiredError) {
            return c.json({ error: 'Unauthorized - Token expired' }, 401);
        }
        return c.json({ error: 'Internal Server Error' }, 500);
    }
};
