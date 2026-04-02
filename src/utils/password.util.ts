export const hashPassword = async (plainText: string): Promise<string> => {
    return await Bun.password.hash(plainText, {
        algorithm: "bcrypt",
        cost: 10,
    });
};

export const verifyPassword = async (plainText: string, hashed: string): Promise<boolean> => {
    return await Bun.password.verify(plainText, hashed);
};
