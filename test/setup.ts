import { db } from '../src/config/db.config';
import { users } from '../src/model/user.model';
import { sessions } from '../src/model/session.model';

export const clearDB = async () => {
    // Delete sessions first to avoid foreign key constraint errors
    await db.delete(sessions).execute();
    await db.delete(users).execute();
};
