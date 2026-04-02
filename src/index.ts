import { Elysia } from 'elysia';
import { db } from './db/db';
import { users } from './db/schema';

const app = new Elysia()
  .get('/', () => 'Hello from Elysia with Bun!')
  .get('/users', async () => {
    try {
      const allUsers = await db.select().from(users);
      return allUsers;
    } catch (error) {
      return { error: 'Database connection failed. Ensure MySQL is running and your .env is correct.' };
    }
  })
  .listen(3000);

console.log(
  `🚀 Server is running at http://${app.server?.hostname}:${app.server?.port}`
);
