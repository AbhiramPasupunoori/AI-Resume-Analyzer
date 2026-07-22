// Leave room for multipart headers under Vercel's 4.5 MB request limit.
const MAX_FILE_SIZE = 4 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

export function validateResumeFile(file) {
  if (!file) {
    return "Please select a resume file.";
  }

  const fileName = file.name.toLowerCase();

  const hasValidExtension = ALLOWED_EXTENSIONS.some((extension) =>
    fileName.endsWith(extension)
  );

  if (!hasValidExtension) {
    return "Only PDF and DOCX files are allowed.";
  }

  if (file.type && !ALLOWED_FILE_TYPES.includes(file.type)) {
    return "Invalid file type. Please upload a PDF or DOCX resume.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Resume file size must be less than 4 MB.";
  }

  return null;
}
