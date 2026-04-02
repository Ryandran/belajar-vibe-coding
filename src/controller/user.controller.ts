import { UserService } from '../service/user.service';
import { AuthService } from '../service/auth.service';

export class UserController {
    static async create({ body, set }: { body: any, set: any }) {
        try {
            const newUser = await UserService.createUser({
                username: body.username,
                email: body.email,
                password: body.password
            });

            set.status = 201;
            return {
                message: "User created successfully",
                data: newUser
            };
        } catch (error: any) {
            set.status = 400;
            return {
                message: error.message === 'User already exists' ? error.message : "Internal server error",
                data: null
            };
        }
    }

    static async getCurrent({ token, set }: any) {
        try {
            const user = await AuthService.getCurrentUser(token);

            if (!user) {
                throw new Error('Token is not valid');
            }

            return {
                data: {
                    id: user.id,
                    name: user.username,
                    email: user.email,
                    created_at: user.createdAt,
                    updated_at: user.updatedAt
                }
            };
        } catch (error: any) {
            set.status = 401;
            return {
                message: error.message === 'Token is not valid' ? error.message : "Internal server error",
                data: null
            };
        }
    }
}
