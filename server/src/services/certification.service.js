// service layer for certification managing feature

// Import model functions
import { 
    createCertification,
    findCertsByUser,
    findAllCerts,
    findCertById,
    updateCertification,
    deleteCertFile,
    deleteCertification,
    uploadCertFile,
} from "../models/certification.model";

function normalizeCert(cert) {
    if (!cert) return cert;

    return {
        ...cert,
        id: cert.id ?? cert._id?.toString?.() ?? cert._id,
        userId: cert.userId?.toString?.() ?? cert.userId,
        userName: cert.userName ?? "Unknown User",
        dateAdded: cert.dateAdded ?? cert.createdAt ?? null,
    };
}

// export upload cert function
// Takes in userId, fileBuffer, filename, meta
// Uploads file to db
export async function uploadCertification(userId, file, meta) {
    if (!file) {
        throw new Error("Certification PDF is required");
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = await uploadCertFile(file.name, buffer);

    return createCertification({
        userId,
        title: meta.title,
        issuer: meta.issuer,
        issueDate: meta.issueDate,
        expirationDate: meta.expirationDate,
        fileId
    });
}

// export get user certs function
// Takes in userID
// returns all user certs
export async function getUserCertification(user) {
    const authUserId = user?.id?.toString?.() ?? user?._id?.toString?.();
    if (!authUserId) throw new Error("Unauthorized");

    const certs = user.role === "admin"
        ? await findAllCerts()
        : await findCertsByUser(authUserId);

    return certs.map(normalizeCert);
}

// Get certs as admin (implement later)

// export get cert function
// Takes in ID and UserId
// returns specific cert
export async function getCertification(id, user) {
    const cert = await findCertById(id);
    const authUserId = user?.id?.toString?.() ?? user?._id?.toString?.();

    if (!cert) {
        throw new Error("Certification not found");
    }

    if (!authUserId) {
        throw new Error("Unauthorized");
    }

    if ( user.role !== "admin" && cert.userId.toString() !== authUserId) {
        throw new Error("Forbidden");
    }

    return normalizeCert(cert);
}

// Export update cert function
// takes in, id, updates, and user
// Updates the cert file
export async function updateCertificationService(id, updates, user) {
    const cert = await findCertById(id);
    const authUserId = user?.id?.toString?.() ?? user?._id?.toString?.();

    if (!cert) {
        throw new Error("Certification not found");
    }

    if (!authUserId) {
        throw new Error("Unauthorized");
    }

    if ( user.role !== "admin" && cert.userId.toString() !== authUserId) {
        throw new Error("Forbidden");
    }

    const updated = await updateCertification(id, updates);
    return normalizeCert(updated);
}

// export remove cert function
// takes in certid and userid
// deletes the cert
export async function deleteCertificationService(id, user) {
    const cert = await findCertById(id);
    const authUserId = user?.id?.toString?.() ?? user?._id?.toString?.();

    if (!cert) {
        throw new Error("Certification not found");
    }

    if (!authUserId) {
        throw new Error("Unauthorized");
    }

    if ( user.role !== "admin" && cert.userId.toString() !== authUserId) {
        throw new Error("Forbidden");
    }

    if (cert.fileId) {
        await deleteCertFile(cert.fileId);
    }

    await deleteCertification(id)
    return { success: true };
}
