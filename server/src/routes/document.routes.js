import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import {
    uploadDocumentController,
    listDocumentsController,
    deleteDocumentController,
    streamDocumentFileController,
} from "../controllers/document.controller.js";

export async function documentRoutes(req) {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/api/documents") {
        const authRes = await requireAuth(req, (r) => r);
        if (authRes instanceof Response) return authRes;
        const adminRes = requireAdmin(authRes, (r) => r);
        if (adminRes instanceof Response) return adminRes;
        return uploadDocumentController(req);
    }

    if (req.method === "GET" && url.pathname === "/api/documents") {
        return requireAuth(req, listDocumentsController);
    }

    if (url.pathname.startsWith("/api/documents")) {
        const parts = url.pathname.split("/");
        const id = parts[3];
        const subroute = parts[4];

        if (req.method === "DELETE" && id && !subroute) {
            const authRes = await requireAuth(req, (r) => r);
            if (authRes instanceof Response) return authRes;
            const adminRes = requireAdmin(authRes, (r) => r);
            if (adminRes instanceof Response) return adminRes;
            return deleteDocumentController(req, { params: { id } });
        }

        if (req.method === "GET" && subroute === "file" && id) {
            return requireAuth(req, (r) =>
                streamDocumentFileController(r, { params: { id } })
            );
        }
    }

    return null;
}
