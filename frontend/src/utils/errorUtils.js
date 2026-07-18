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
    return data.analysis;
  }

  if (data?.job_title) {
    return data.job_title[0];
  }

  if (data?.description) {
    return data.description[0];
  }

  if (data?.resume_id) {
    return data.resume_id;
  }

  if (data?.job_description_id) {
    return data.job_description_id;
  }

  return "Something went wrong. Please check your input and try again.";
}