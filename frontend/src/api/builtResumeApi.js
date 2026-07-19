import apiClient from "./client";

export async function createBuiltResume(data) {
  const response = await apiClient.post("/built-resumes/", data);
  return response.data;
}

export async function getBuiltResumes() {
  const response = await apiClient.get("/built-resumes/");
  return response.data;
}

export async function getBuiltResume(id) {
  const response = await apiClient.get(`/built-resumes/${id}/`);
  return response.data;
}

export async function updateBuiltResume(id, data) {
  const response = await apiClient.put(`/built-resumes/${id}/`, data);
  return response.data;
}

export async function deleteBuiltResume(id) {
  const response = await apiClient.delete(`/built-resumes/${id}/`);
  return response.data || {};
}

export async function prepareBuiltResumeAnalysis(id, data) {
  const response = await apiClient.post(
    `/built-resumes/${id}/prepare-analysis/`,
    data
  );

  return response.data;
}
