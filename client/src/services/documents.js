const API = "/api/documents";

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export async function getDocuments() {
  const res = await fetch(API, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch documents");

  return res.json();
}

export async function uploadDocument(formData) {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Upload failed");
  }
  return res.json();
}

export async function deleteDocument(id) {
  const res = await fetch(`${API}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Delete failed");
  }
}
