// model for certification managing feature

// import necessary mongodb functions
import { connectDB } from "../config/db.js";
import { ObjectId, GridFSBucket } from "mongodb";        //Gridfs is needed to store pdfs in mongodb and allows file streaming

// Certification schema definition
const certificationSchema = {
    userId: "ObjectId",
    title: "string",
    issuer: "string",
    issueDate: "date",
    expirationDate: "date",
    fileId: "ObjectId"
};

// create collection and get from db
async function collection() {
    const conn = await connectDB();
    return conn.db.collection("certifications");
}

function toObjectId(value) {
    if (!value) return value;
    if (ObjectId.isValid(value)) return new ObjectId(value.toString());
    return value;
}

function certificationAggregatePipeline(match = null) {
    const pipeline = [];

    if (match) {
        pipeline.push({ $match: match });
    }

    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                userName: "$user.name",
                dateAdded: "$createdAt"
            }
        },
        {
            $project: {
                user: 0
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    );

    return pipeline;
}

// Certification data validation
function validateCertification(data) {
    if (!data.userId) throw new Error("userId required");
    if (!data.title) throw new Error("title required");
    if (!data.fileId) throw new Error("fileId required");
}

// Normalize certification document
function normalizeDoc(data) {
    return {
        userId: ObjectId.isValid(data.userId)
            ? new ObjectId(data.userId)
            : data.userId,
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
    const coll = await collection();
    const result = await coll.insertOne(doc);
    return { _id: result.insertedId, ...doc };
}

// export find cert by user
// takes in user id
// returns a list of all certs tied to user id
export async function findCertsByUser(userId) {
    const coll = await collection();
    return coll
        .aggregate(certificationAggregatePipeline({ userId: toObjectId(userId) }))
        .toArray();
}

// export admin find all certs
export async function findAllCerts() {
    const coll = await collection();
    return coll
        .aggregate(certificationAggregatePipeline())
        .toArray();
}

// export find cert by id
// takes in id
// returns specific cert
export async function findCertById(id) {
    const coll = await collection();
    return coll.findOne({ _id: new ObjectId(id) });
}

// export update certification data
export async function updateCertification(id, updates) {
    const updateDoc = {
        ...updates,
        updatedAt: new Date()
    };

    const coll = await collection();
    await coll.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateDoc }
    );

    return findCertById(id);
}

// export delete cert metadata function
// takes in id
// deletes specific cert metadata
export async function deleteCertification(id) {
    const coll = await collection();
    return coll.deleteOne({
        _id: new ObjectId(id)
    });
}

// export GridFS functions
// Helps out mongodb, do more reasearch on this.

// GridFS bucket for cert files
export async function getCertBucket() {
    const conn = await connectDB();
    return new GridFSBucket(conn.db, {
        bucketName: "certFiles"
    });
}

//Delete from GridFS
export async function deleteCertFile(fileId) {
    const bucket = await getCertBucket();
    return bucket.delete(new ObjectId(fileId));
}

// Upload to GridFS
export async function uploadCertFile(filename, buffer) {
    const bucket = await getCertBucket();
    
    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: "application/pdf"
        });

        uploadStream.end(buffer);

        uploadStream.on("finish", () => {
            resolve(uploadStream.id);
        });

        uploadStream.on("error", reject);
    });
}

export{ certificationSchema };
