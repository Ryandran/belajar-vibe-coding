import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { userRoute } from './route/user.route';
import { authRoute } from './route/auth.route';
import { BadRequestError, UnauthorizedError } from './utils/error';

export const app = new Elysia()
    .use(swagger({
        path: '/swagger',
        documentation: {
            info: {
                title: 'Belajar Vibe Coding API',
                version: '1.0.0',
                description: 'Interactive API documentation for user management and authentication system.'
            },
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            }
        }
    }))
    .onError(({ code, error, set }) => {
        if (error instanceof UnauthorizedError) {
            set.status = 401;
            return {
                message: error.message
            };
        }
        if (error instanceof BadRequestError) {
            set.status = 400;
            return {
                message: error.message,
                data: null
            };
        }
        if (code === 'VALIDATION') {
            set.status = 400;
            return {
                message: 'Validation failed'
            };
        }
        
        console.error(error);
        set.status = 500;
        return {
            message: 'Internal server Error'
        }
    })
    .get('/', () => 'Server is running!')
    .use(userRoute)
    .use(authRoute);
