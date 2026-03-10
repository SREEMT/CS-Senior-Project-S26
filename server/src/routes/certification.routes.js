// routes for certification managing feature

import { requireAuth } from "../middlewate/auth.middleware.js";

import {
    uploadCertificationController,
    getUserCertifications,
    getCertificationController,
    streamCertificationsController,
    deleteCertificationController,
    getUsercertificationsController
} from "../controllers/certification.controller.js";

export async function certificationRoutes(req) {
    const url = new URL(req.url);

    // POST /api/certifications
    // upload cert
    if (req.method === "POST" && url.pathname === "/api/certfications") {
        return requireAuth(req, uploadCertificationController);
    }

    // GET /api/certifications
    // Get all certifications for auth user
    if (req.method === "GET" && url.pathname === "/api/certifications") {
        return requireAuth(req, getUsercertificationsController);
    }

    // Routes with ID
    if (url.pathname.startsWith("/api/certifications")) {
        const parts = url.pathname.split("/");
        const id = parts[3];
        const subroute = parts[4];

        // GET .../:ID
        if (req.method === "GET" && !subroute) {
            return requireAuth(req, (req) => 
                getCertificationController(req, { params: { id } })
            );
        }

        // GET .../:id/file
        if (req.method === "DELETE") {
            return requireAuth(req, (req) => 
                deleteCertificationController(req, { params: { id } })
            ); 
        }
    }
    return null;
}