import apiClient from "./client";

export async function createJobDescription({
  jobTitle,
  companyName,
  description,
}) {
  const response = await apiClient.post("/job-descriptions/", {
    job_title: jobTitle,
    company_name: companyName,
    description,
  });

  return response.data;
}
