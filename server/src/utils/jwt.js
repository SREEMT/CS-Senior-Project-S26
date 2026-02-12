// JWT utilities to sign and verify a JWT token cookie for authentication

import jwt from "jsonwebtoken";

// Change this later once .env file is created
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export function signJWT(payload) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "1h"
    });
}

export function verifyJWT(token) {
    return jwt.verify(token, JWT_SECRET);
}