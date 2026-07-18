import apiClient from "./client";

export async function uploadResume(file, onUploadProgress) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await apiClient.post("/resumes/upload/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });

  return response.data;
}
export async function deleteResume(resumeId) {
  const response = await apiClient.delete(`/resumes/${resumeId}/`);

  return response.data;
}