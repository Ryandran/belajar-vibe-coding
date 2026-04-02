import { Elysia } from 'elysia';
import { AuthService } from '../service/auth.service';
import { UnauthorizedError } from '../utils/error';

export const authPlugin = (app: Elysia) => 
    app.derive(async ({ headers }) => {
        const authHeader = headers.authorization || headers.Authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('Token is not valid');
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            throw new UnauthorizedError('Token is not valid');
        }

        // Validate token and get user from database
        const user = await AuthService.getCurrentUser(token);

        return {
            user,
            token
        };
    });
