import { AuthService } from '../service/auth.service';

export class AuthController {
    static async login({ body, set }: { body: any, set: any }) {
        try {
            const session = await AuthService.login(body.email, body.password);

            if (!session) {
                throw new Error('Internal server error');
            }

            return {
                message: "Token has been generated",
                data: {
                    token: session.token,
                    created_at: session.created_at
                }
            };
        } catch (error: any) {
            set.status = 400; // Unauthorized or Bad Request
            return {
                message: error.message === 'email or password is wrong' ? error.message : "Internal server error",
                data: null
            };
        }
    }
}
