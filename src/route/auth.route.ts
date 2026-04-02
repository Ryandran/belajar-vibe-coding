import { Elysia, t } from 'elysia';
import { AuthController } from '../controller/auth.controller';
import { UserController } from '../controller/user.controller';
import { authPlugin } from '../middleware/auth.middleware';

export const authRoute = new Elysia({ prefix: '/api/users' })
    .post('/login', AuthController.login, {
        body: t.Object({
            email: t.String(),
            password: t.String()
        })
    })
    .group('', (app) => 
        app.use(authPlugin)
           .get('/current-user', UserController.getCurrent)
           .delete('/logout', AuthController.logout)
    );
