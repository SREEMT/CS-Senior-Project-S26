// model for certification managing feature

// import necessary mongodb functions
import { createDeflate } from "zlib";
import { connectDB } from "../config/db.js";
import { ObjectId, GridFSBucket } from "mongodb";        //Gridfs is needed to store pdfs in mongodb and allows file streaming
import { file } from "bun";

// Certification schema definition
const certificationSchema = {
    userId: "ObjectId",
    title: "string",
    issuer: "string",
    issueDate: "date",
    expirationDate: "date",
    fileId: "ObjecyId"
};

// create collection and get from db
function collection() {
    return connectDB().collection("certifications");
}

// Certification data validation
function validateCertification(data) {
    if (!data.userId) throw new Error("userId required");
    if (!data.title) throw new Error("title required");
}

// Normalize certification document
function normalizeDoc(data) {
    return {
        userId: new ObjectId(data.userId),
        title: data.title,
        issuer: data.issuer ?? null,
        issueDate: data.issueDate ? new Date(data.issueDate) : null,
        expirationDate: data.expirationDate
            ? new Date(data.expirationDate)
            : null,
        fileId: data.fileId ? new ObjectId(data.fileId) : null,
        createdAt: new Date(),
        updatedAt: new Date()
    };
}

// export create cert doc function
// takes in data to store
// stores data and returns id
export async function createCertification(data) {
    validateCertification(data);
    const doc = normalizeDoc(data);
    const result = await collection().insertOne(doc);
    return { _id: result.insertedId, ...doc };
}

// export find cert by user
// takes in user id
// returns a list of all certs tied to user id
export async function findCertsByUser(userId) {
    return collection()
        .find({ userId: new ObjectId(userId) })
        .sort({ createAt: -1 })
        .toArray();
}

// export find cert by id
// takes in id
// returns specific cert
export async function findCertById(id) {
    return collection().findOne({ _id: new ObjectId(id) });
}

// export update certification data
export async function updateCertification(id, updates) {
    const updateDoc = {
        ...updates,
        updatedAt: new Date()
    };

    await collection().updateOne(
        { _id: new ObjectId(id) },
        { $set: updateDoc }
    );

    return findCertById(id);
}

// export delete cert metadata function
// takes in id
// deletes specific cert metadata
export async function deleteCertification(id) {
    return collection().deleteOne({
        _id: new ObjectId(id)
    });
}

// export GridFS functions
// Helps out mongodb, do more reasearch on this.

// GridFS bucket for cert files
export function getCertBucket() {
    return new GridFSBucket(connectDB(), {
        bucketName: "certFiles"
    });
}

//Delete from GridFS
export async function deleteCertFile(fileId) {
    const bucker = getCertBucket();
    return bucket.delete(new ObjectId(fileId));
}

// Upload to GridFS
export async function uploadCertFile(filename, buffer) {
    const bucket = getCertBucket();
    const uploadStream = bucket.openUploadStream(filename, {
        contentType: "application/pdf"
    });

    uploadStream.end(buffer);
    return uploadStream.id;
}

export{ certificationSchema };

// Admin find all certs (implement later)