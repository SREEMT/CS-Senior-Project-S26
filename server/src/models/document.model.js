import { connectDB } from "../config/db.js";
import { ObjectId, GridFSBucket } from "mongodb";

const documentSchema = {
    userId: "ObjectId",
    title: "string",
    fileId: "ObjectId",
};

async function collection() {
    const conn = await connectDB();
    return conn.db.collection("documents");
}

function documentAggregatePipeline(match = null) {
    const pipeline = [];

    if (match) {
        pipeline.push({ $match: match });
    }

    pipeline.push(
        {
            $sort: {
                createdAt: -1,
            },
        }
    );

    return pipeline;
}

function validateDocument(data) {
    if (!data.userId) throw new Error("userId required");
    if (!data.title) throw new Error("title required");
    if (!data.fileId) throw new Error("fileId required");
}

function normalizeDoc(data) {
    return {
        userId: ObjectId.isValid(data.userId)
            ? new ObjectId(data.userId)
            : data.userId,
        title: data.title,
        fileId: data.fileId ? new ObjectId(data.fileId) : null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

export async function createDocument(data) {
    validateDocument(data);
    const doc = normalizeDoc(data);
    const coll = await collection();
    const result = await coll.insertOne(doc);
    return { _id: result.insertedId, ...doc };
}

export async function findAllDocuments() {
    const coll = await collection();
    return coll.aggregate(documentAggregatePipeline()).toArray();
}

export async function findDocumentById(id) {
    const coll = await collection();
    return coll.findOne({ _id: new ObjectId(id) });
}

export async function deleteDocument(id) {
    const coll = await collection();
    return coll.deleteOne({
        _id: new ObjectId(id),
    });
}

export async function getDocumentBucket() {
    const conn = await connectDB();
    return new GridFSBucket(conn.db, {
        bucketName: "documentFiles",
    });
}

export async function deleteDocumentFile(fileId) {
    const bucket = await getDocumentBucket();
    return bucket.delete(new ObjectId(fileId));
}

export async function uploadDocumentFile(filename, buffer) {
    const bucket = await getDocumentBucket();

    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: "application/pdf",
        });

        uploadStream.end(buffer);

        uploadStream.on("finish", () => {
            resolve(uploadStream.id);
        });

        uploadStream.on("error", reject);
    });
}

export { documentSchema };
