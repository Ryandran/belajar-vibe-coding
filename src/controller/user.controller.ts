import { UserService } from '../service/user.service';

export class UserController {
    static async create({ body }: { body: any }) {
        const newUser = await UserService.createUser({
            username: body.username,
            email: body.email,
            password: body.password
        });

        return {
            message: "User created successfully",
            data: newUser
        };
    }

    static async getCurrent({ user }: any) {
        return {
            data: {
                id: user.id,
                name: user.username,
                email: user.email,
                created_at: user.createdAt,
                updated_at: user.updatedAt
            }
        };
    }
}
