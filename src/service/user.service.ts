import { eq, or } from 'drizzle-orm';
import { db } from '../config/db.config';
import { users } from '../model/user.model';
import { hashPassword } from '../utils/password.util';
import { BadRequestError } from '../utils/error';

export class UserService {
    /**
     * Memproses registrasi pembuatan user baru ke dalam database.
     * Fungsi ini akan melakukan validasi duplikasi username dan email terlebih dahulu,
     * kemudian melakukan hashing pada password sebelum disimpan dengan aman.
     * Mengembalikan data user yang baru dibuat tanpa menyertakan field password.
     * 
     * @param data Payload data user baru (username, email, password)
     * @returns Objek response berisikan data profile user (tanpa password)
     * @throws {BadRequestError} Jika username atau email sudah digunakan dalam sistem
     */
    static async createUser(data: typeof users.$inferInsert) {
        // Cek duplikasi
        const existingUsers = await db.select().from(users).where(
            or(
                eq(users.username, data.username),
                eq(users.email, data.email)
            )
        );
        
        if (existingUsers.length > 0) {
            throw new BadRequestError('User already exists');
        }

        // Hash password
        const hashedPassword = await hashPassword(data.password);

        const newData = {
            ...data,
            password: hashedPassword
        }

        // Insert
        const [result] = await db.insert(users).values(newData);
        const insertId = result.insertId;

        // Fetch user data untuk response (tanpa password)
        const [newUser] = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            created_at: users.createdAt,
            updated_at: users.updatedAt
        }).from(users).where(eq(users.id, insertId));

        return newUser;
    }
}
