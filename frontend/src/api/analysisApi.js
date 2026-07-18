import apiClient from "./client";

export async function createAnalysis({
  resumeId,
  jobDescriptionId,
}) {
  const response = await apiClient.post("/analyses/", {
    resume_id: resumeId,
    job_description_id: jobDescriptionId,
  });

  return response.data;
}

export async function getAnalysis(analysisId) {
  const response = await apiClient.get(`/analyses/${analysisId}/`);

  return response.data;
}

export async function getAnalyses() {
  const response = await apiClient.get("/analyses/");

  return response.data;
}
export async function deleteAnalysis(analysisId) {
  const response = await apiClient.delete(`/analyses/${analysisId}/`);

  return response.data;
}