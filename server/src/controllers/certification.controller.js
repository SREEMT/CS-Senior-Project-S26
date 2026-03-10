// controller layer for certification managing feature

// Import controller services
import { 
    uploadCertification,
    getUserCertifications,
    getCertification,
    updateCertificationService,
    deleteCertificationService
} from "../services/certification.service";

// Export upload cert function
// Takes in req and user
// Returns cert data and uploads
export async function  uploadCertificationController(req) {
    try {
        const formData = await req.formData();

        const file = formData.get("file");

        const meta = {
            title: formData.get("title"),
            issue: formData.get("issuer"),
            issueDate: formData.get("issueDate"),
            expirationDate: formData.get("expirationDate")
        };

        const user = req.user;
        const cert = await uploadCertification(user.id, file, meta);

        return new Response(JSON.stringify(cert), {
            status: 201,
            headers: { "Content-Type": "application/json"}
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 400 }
        );
    }
}

// get user certifications function
// Takes in req and user
// Returns all of the user's certs
export async function getCertificationController(req, { params }) {
    try {
        const cert = await getCertification(params.id, req.user);

        return new Response(JSON.stringify(cert), {
            status: 200,
            headers: { "Content-Type": "application/json"}
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 404 }
        );
    }
}

// update certification
// Takes in requests and params
// updates a certification from user
export async function updateCertificationController(req, { params }) {
    try {
        const body = await req.json();

        const cert = await updateCertificationService(
            params.id,
            body,
            req.user
        );

        return new Response(JSON.stringify(cert), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 400 }
        );
    }
}

// Delete a certification
// Takes in a request and params
// Deletes a selected certification
export async function deleteCertificationController(req, { params }) {
    try {
        const result = await deleteCertificationService(
            params.id,
            req.user
        );

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 400 }
        );
    }
}