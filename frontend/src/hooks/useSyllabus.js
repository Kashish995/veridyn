// frontend/src/services/syllabus.service.js

export async function uploadSyllabus(file) {
  const formData = new FormData();
  formData.append("syllabus", file);

  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/upload-syllabus`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Upload failed");
  }

  const data = await res.json();
  return data.syllabusText;
}
