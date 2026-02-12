import { findUserByEmail } from "../models/user.model.js";
import { comparePassword } from "../utils/password.js";
import { signJWT } from "../utils/jwt.js";

export async function login(email, password) {
    const user = await findUserByEmail(email);

    if (!user) {
        throw new Error("Invalid credentials");
    }

    const valid = await comparePassword(password, user.password);

    if (!valid) {
        throw new Error("Invalid credentials");
    }

    return signJWT({ userId: user.id });
}