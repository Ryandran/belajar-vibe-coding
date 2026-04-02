import { Elysia } from 'elysia';

export const authPlugin = (app: Elysia) => 
    app.derive(({ headers, set }) => {
        const authHeader = headers.authorization || headers.Authorization;
        
        if (!authHeader) {
            set.status = 401;
            throw new Error('Token is not valid');
        }

        if (!authHeader.startsWith('Bearer ')) {
            set.status = 401;
            throw new Error('Token is not valid');
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            set.status = 401;
            throw new Error('Token is not valid');
        }

        return {
            token
        };
    });
