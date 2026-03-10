const API = "/api/certifications";

function authHeaders() {
    return {
        Authorization: `Bearer ${localStorage.getItem("token")}`
    };
}

export async function getCertifications() {
    const res = await fetch(API, {
        headers: authHeaders()
    });

    if (!res.ok) throw new Error("Failed to fetch certifications");

    return res.json();
}

export async function uploadCertification(formData) {
    const res = await fetch(API, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
    });

    if (!res.ok) throw new Error("Upload Failed");
    return res.json();
}

export async function deleteCertification(id) {
    const res = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: authHeaders()
    });
    if (!res.ok) throw new Error("Delete failed");
}