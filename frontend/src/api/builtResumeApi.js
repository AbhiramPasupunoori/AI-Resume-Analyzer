import apiClient from "./client";

export async function createBuiltResume(data) {
  const response = await apiClient.post("/built-resumes/", data);
  return response.data;
}

export async function updateBuiltResume(id, data) {
  const response = await apiClient.put(`/built-resumes/${id}/`, data);
  return response.data;
}

export async function prepareBuiltResumeAnalysis(id, data) {
  const response = await apiClient.post(
    `/built-resumes/${id}/prepare-analysis/`,
    data
  );

  return response.data;
}