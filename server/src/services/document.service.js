import {
    createDocument,
    findAllDocuments,
    findDocumentById,
    deleteDocumentFile,
    deleteDocument,
    uploadDocumentFile,
} from "../models/document.model.js";

function normalizeDocument(doc) {
    if (!doc) return doc;

    return {
        ...doc,
        id: doc.id ?? doc._id?.toString?.() ?? doc._id,
        userId: doc.userId?.toString?.() ?? doc.userId,
        dateAdded: doc.dateAdded ?? doc.createdAt ?? null,
    };
}

function assertPdfFile(file) {
    if (!file) {
        throw new Error("Document PDF is required");
    }
    const name = typeof file.name === "string" ? file.name.toLowerCase() : "";
    const type = file.type || "";
    if (type !== "application/pdf" && !name.endsWith(".pdf")) {
        throw new Error("Only PDF files are allowed");
    }
}

export async function uploadDocument(userId, file, meta) {
    assertPdfFile(file);
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = await uploadDocumentFile(file.name, buffer);

    return createDocument({
        userId,
        title: meta.title,
        fileId,
    });
}

export async function listDocuments() {
    const docs = await findAllDocuments();
    return docs.map(normalizeDocument);
}

export async function deleteDocumentService(id) {
    const doc = await findDocumentById(id);

    if (!doc) {
        throw new Error("Document not found");
    }

    if (doc.fileId) {
        await deleteDocumentFile(doc.fileId);
    }

    await deleteDocument(id);
    return { success: true };
}
