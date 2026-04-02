export const hashPassword = async (plainText: string): Promise<string> => {
    return await Bun.password.hash(plainText, {
        algorithm: "bcrypt",
        cost: 10,
    });
};
