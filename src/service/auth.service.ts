import { eq } from 'drizzle-orm';
import { db } from '../config/db.config';
import { users } from '../model/user.model';
import { sessions } from '../model/session.model';
import { verifyPassword } from '../utils/password.util';

export class AuthService {
    static async login(email: string, password: string) {
        // 1. Cari user berdasarkan email
        const [user] = await db.select().from(users).where(eq(users.email, email));

        if (!user) {
            throw new Error('email or password is wrong');
        }

        // 2. Verifikasi password
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            throw new Error('email or password is wrong');
        }

        // 3. Generate UUID token
        const token = crypto.randomUUID();

        // 4. Buat session baru di database
        const [sessionResult] = await db.insert(sessions).values({
            token,
            userId: user.id,
        });

        // 5. Ambil data session yang baru dibuat untuk mendapatkan timestamp default-nya
        const results = await db.select({
            token: sessions.token,
            created_at: sessions.createdAt
        }).from(sessions).where(eq(sessions.id, sessionResult.insertId)).limit(1);

        if (results.length === 0) {
            throw new Error('Internal server error: could not create session');
        }

        return results[0];
    }
}
