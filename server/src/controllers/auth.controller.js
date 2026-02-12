import { login } from "../services/auth.service.js";

export async function loginController(req) {
    try {
        const body = await req.json();
        const token = await login(body.email, body.password);

        return new Response(
            JSON.stringify({ token }),
            { status: 200 }
        );
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 401 }
        );
    }
}