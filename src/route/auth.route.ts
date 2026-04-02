import { Elysia, t } from 'elysia';
import { AuthController } from '../controller/auth.controller';

export const authRoute = new Elysia({ prefix: '/api/users' })
    .post('/login', AuthController.login, {
        body: t.Object({
            email: t.String(),
            password: t.String()
        })
    });
