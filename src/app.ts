import { Elysia } from 'elysia';
import { userRoute } from './route/user.route';

export const app = new Elysia()
    .get('/', () => 'Server is running!')
    .use(userRoute);
