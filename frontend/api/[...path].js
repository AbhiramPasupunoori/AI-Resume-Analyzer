import { readFile } from "node:fs/promises";

import formidable from "formidable";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

import { analyze, extractSkills, resumeText } from "./lib/analysis.js";
import * as store from "./lib/githubStore.js";

export const config = { api: { bodyParser: false } };

function send(response, status, body) {
  if (status === 204) return response.status(204).end();
  return response.status(status).json(body);
}

function summary(record, includeText = false) {
  const text = record.extracted_text || "";
  const value = {
    id: record.id, original_filename: record.original_filename, file_type: record.file_type,
    file_size: record.file_size, text_extracted: Boolean(text.trim()), word_count: text.trim().split(/\s+/).filter(Boolean).length,
    character_count: text.length, detected_skills: extractSkills(text), created_at: record.created_at,
  };
  if (includeText) Object.assign(value, { extracted_text: text, file_url: null });
  return value;
}

async function parseUpload(request) {
  const [, files] = await formidable({ maxFileSize: 4 * 1024 * 1024, maxFiles: 1 }).parse(request);
  const fileValue = files.file;
  const file = Array.isArray(fileValue) ? fileValue[0] : fileValue;
  if (!file) throw new Error("Please select a resume file.");
  const extension = file.originalFilename?.split(".").pop()?.toLowerCase();
  if (!new Set(["pdf", "docx"]).has(extension)) throw new Error("Only PDF and DOCX resume files are supported.");
  const buffer = await readFile(file.filepath);
  let text;
  if (extension === "docx") {
    text = (await mammoth.extractRawText({ buffer })).value;
  } else {
    const parser = new PDFParse({ data: buffer });
    try { text = (await parser.getText()).text; } finally { await parser.destroy(); }
  }
  if (!text?.trim()) throw new Error("No readable text was found in this resume.");
  return { file, extension, text: text.trim() };
}

function pathParts(request) {
  const value = request.query.path;
  return (Array.isArray(value) ? value : String(value || "").split("/")).filter(Boolean);
}

async function readJsonBody(request) {
  if (request.body && typeof request.body === "object") return request.body;
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method === "OPTIONS") return send(response, 204);
  const parts = pathParts(request);

  try {
    if (request.headers["content-type"]?.includes("application/json")) {
      request.body = await readJsonBody(request);
    }
    if (parts[0] === "health") {
      if (parts[1] === "storage") return send(response, 200, { status: "healthy", storage: "GitHub JSON", connected: true, ...(await store.health()) });
      return send(response, 200, { status: "healthy", application: "AI Resume Analyzer", backend: "Vercel JavaScript Function" });
    }

    if (parts[0] === "resumes" && parts[1] === "upload" && request.method === "POST") {
      const { file, extension, text } = await parseUpload(request);
      const record = await store.create("resumes", { original_filename: file.originalFilename, file_type: extension, file_size: file.size, extracted_text: text });
      return send(response, 201, { message: "Resume uploaded successfully.", resume: summary(record, true) });
    }
    if (parts[0] === "job-descriptions" && !parts[1] && request.method === "POST") {
      const jobTitle = String(request.body.job_title || "").trim();
      const description = String(request.body.description || "").trim();
      if (!jobTitle || description.length < 30) return send(response, 400, { detail: "A job title and detailed description are required." });
      return send(response, 201, await store.create("job-descriptions", { job_title: jobTitle, company_name: String(request.body.company_name || "").trim(), description, required_skills: extractSkills(description) }));
    }

    if (parts[0] === "analyses" && !parts[1] && request.method === "POST") {
      const resume = await store.get("resumes", request.body.resume_id);
      const job = await store.get("job-descriptions", request.body.job_description_id);
      if (!resume || !job) return send(response, 400, { detail: "Resume or job description not found." });
      const result = analyze(resume, job);
      const record = await store.create("analyses", { ...result, resume_id: resume.id, job_description_id: job.id, resume: summary(resume), job_description: { id: job.id, job_title: job.job_title, company_name: job.company_name, required_skills: job.required_skills, created_at: job.created_at } });
      return send(response, 201, record);
    }
    if (parts[0] === "analyses" && !parts[1] && request.method === "GET") return send(response, 200, await store.list("analyses"));
    if (parts[0] === "analyses" && parts[1]) {
      const analysis = await store.get("analyses", parts[1]);
      if (!analysis) return send(response, 404, { detail: "Analysis not found." });
      if (request.method === "GET") return send(response, 200, analysis);
      if (request.method === "DELETE") { await store.remove("analyses", parts[1]); return send(response, 204); }
    }

    if (parts[0] === "built-resumes" && parts[2] === "prepare-analysis" && request.method === "POST") {
      const built = await store.get("built-resumes", parts[1]);
      if (!built) return send(response, 404, { detail: "Built resume not found." });
      const text = resumeText(built);
      const resume = await store.create("resumes", { original_filename: `${built.full_name} Built Resume.docx`, file_type: "docx", file_size: Buffer.byteLength(text), extracted_text: text });
      const job = await store.create("job-descriptions", { job_title: request.body.job_title, company_name: request.body.company_name || "", description: request.body.description, required_skills: extractSkills(request.body.description) });
      return send(response, 201, { resume_id: resume.id, job_description_id: job.id, resume: summary(resume), job_description: job });
    }
    if (parts[0] === "built-resumes" && !parts[1] && request.method === "POST") {
      return send(response, 201, await store.create("built-resumes", request.body));
    }

    return send(response, 404, { detail: "API route not found." });
  } catch (error) {
    const clientError = /resume|PDF|DOCX|file|detailed|required/i.test(error.message);
    return send(response, clientError ? 400 : 503, { detail: error.message || "Request failed." });
  }
}
