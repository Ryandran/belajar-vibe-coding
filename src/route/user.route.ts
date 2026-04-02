import { Elysia, t } from 'elysia';
import { UserController } from '../controller/user.controller';

export const userRoute = new Elysia({ prefix: '/api/v1' })
    .post('/user', UserController.create, {
        body: t.Object({
            username: t.String({ minLength: 3, maxLength: 255 }),
            email: t.String({ maxLength: 255, pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' }),
            password: t.String({ minLength: 8, maxLength: 255 })
        })
    });
