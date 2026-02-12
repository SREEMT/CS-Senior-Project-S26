// Password verification and security utilizing built in Bun hasher

export async function hashPassword(password){
    return await Bun.password.hash(password);
}

export async function comparePassword(password, hash) {
    return await Bun.password.verify(password, hash);
}