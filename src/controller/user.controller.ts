import { UserService } from '../service/user.service';

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
}
