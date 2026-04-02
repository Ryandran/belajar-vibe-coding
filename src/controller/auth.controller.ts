import { AuthService } from '../service/auth.service';

export class AuthController {
    static async login({ body }: { body: any }) {
        const session = await AuthService.login(body.email, body.password);

        return {
            message: "Token has been generated",
            data: {
                token: session!.token,
                created_at: session!.created_at
            }
        };
    }

    static async logout({ token }: { token: string }) {
        await AuthService.logout(token);
        return {
            data: "OK"
        };
    }
}
