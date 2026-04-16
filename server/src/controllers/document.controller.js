import {
    uploadDocument,
    listDocuments,
    deleteDocumentService,
} from "../services/document.service.js";
import { findDocumentById, getDocumentBucket } from "../models/document.model.js";

export async function uploadDocumentController(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("file");
        const title = formData.get("title");
        const userId = req.user.id?.toString?.() ?? req.user._id?.toString?.();

        const doc = await uploadDocument(userId, file, { title });

        return new Response(JSON.stringify(doc), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 400,
        });
    }
}

export async function listDocumentsController(req) {
    try {
        const docs = await listDocuments();

        return new Response(JSON.stringify(docs), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 400,
        });
    }
}

export async function deleteDocumentController(req, { params }) {
    try {
        const result = await deleteDocumentService(params.id);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 400,
        });
    }
}

export async function streamDocumentFileController(req, { params }) {
    try {
        const doc = await findDocumentById(params.id);

        if (!doc) {
            return new Response(JSON.stringify({ error: "Document not found" }), {
                status: 404,
            });
        }

        const bucket = await getDocumentBucket();
        const stream = bucket.openDownloadStream(doc.fileId);

        return new Response(stream, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "inline",
            },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
        });
    }
}
