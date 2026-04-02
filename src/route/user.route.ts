import { Elysia, t } from 'elysia';
import { UserController } from '../controller/user.controller';

export const userRoute = new Elysia({ prefix: '/api/v1' })
    .post('/user', UserController.create, {
        body: t.Object({
            username: t.String(),
            email: t.String(),
            password: t.String()
        })
    });
