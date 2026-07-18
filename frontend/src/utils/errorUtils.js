export function getErrorMessage(error) {
  if (!error) {
    return "Something went wrong. Please try again.";
  }

  if (!error.response) {
    return "Could not connect to the backend. Please check if Django is running.";
  }

  const data = error.response.data;

  if (typeof data === "string") {
    return data;
  }

  if (data?.detail) {
    return data.detail;
  }

  if (data?.file && Array.isArray(data.file)) {
    return data.file[0];
  }

  if (data?.analysis) {
    return Array.isArray(data.analysis) ? data.analysis[0] : data.analysis;
  }

  if (data?.job_title) {
    return Array.isArray(data.job_title) ? data.job_title[0] : data.job_title;
  }

  if (data?.description) {
    return Array.isArray(data.description)
      ? data.description[0]
      : data.description;
  }

  if (data?.resume_id) {
    return Array.isArray(data.resume_id) ? data.resume_id[0] : data.resume_id;
  }

  if (data?.job_description_id) {
    return Array.isArray(data.job_description_id)
      ? data.job_description_id[0]
      : data.job_description_id;
  }

  return "Something went wrong. Please check your input and try again.";
}
