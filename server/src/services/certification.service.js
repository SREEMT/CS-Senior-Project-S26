// service layer for certification managing feature

// Import model functions
import { 
    createCertification,
    findCertsByUser,
    findCertById,
    updateCertification,
    deleteCertFile,
    deleteCertification,
    uploadCertFile,
} from "../models/certification.model";

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
    return findCertsByUser(user.id.toString());
}

// Get certs as admin (implement later)

// export get cert function
// Takes in ID and UserId
// returns specific cert
export async function getCertification(id, user) {
    const cert = await findCertById(id);

    if (!cert) {
        throw new Error("Certification not found");
    }

    if ( user.role !== "admin" && cert.userId.toString() !== user.id) {
        throw new Error("Forbidden");
    }

    return cert;
}

// Export update cert function
// takes in, id, updates, and user
// Updates the cert file
export async function updateCertificationService(id, updates, user) {
    const cert = await findCertById(id);

    if (!cert) {
        throw new Error("Certification not found");
    }
    
    if ( user.role !== "admin" && cert.userId.toString() !== user.id) {
        throw new Error("Forbidden");
    }

    return updateCertification(id, updates);
}

// export remove cert function
// takes in certid and userid
// deletes the cert
export async function deleteCertificationService(id, user) {
    const cert = await findCertById(id);

    if (!cert) {
        throw new Error("Certification not found");
    }

    if ( user.role !== "admin" && cert.userId.toString() !== user.id) {
        throw new Error("Forbidden");
    }

    if (cert.fileId) {
        await deleteCertFile(cert.fileId);
    }

    await deleteCertification(id)
    return { success: true };
}