import { readFile } from "node:fs/promises";

import { analyze, extractSkills, resumeText } from "./lib/analysis.js";
import * as auth from "./lib/auth.js";
import * as store from "./lib/githubStore.js";

export const config = { api: { bodyParser: false } };

function send(response, status, body) {
  response.statusCode = status;
  if (status === 204) return response.end();
  response.setHeader("Content-Type", "application/json");
  return response.end(JSON.stringify(body));
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
  const [
    { default: formidable },
    { default: mammoth },
    canvas,
  ] = await Promise.all([
    import("formidable"),
    import("mammoth"),
    import("@napi-rs/canvas"),
  ]);

  // PDF.js expects these browser geometry APIs in its Node runtime. Importing
  // the canvas package explicitly also makes Vercel include its native Linux
  // binary when tracing this serverless function.
  globalThis.DOMMatrix ??= canvas.DOMMatrix;
  globalThis.ImageData ??= canvas.ImageData;
  globalThis.Path2D ??= canvas.Path2D;

  // Preload the worker through a literal import so Vercel traces and bundles
  // it. PDF.js otherwise tries to resolve a relative pdf.worker.mjs at runtime,
  // but that file is omitted from the serverless function output.
  await import("pdfjs-dist/legacy/build/pdf.worker.mjs");

  // Load PDF.js only after its Node polyfills have been installed. A static or
  // concurrent import can evaluate PDF.js first and fail with "DOMMatrix is not
  // defined" on Vercel.
  const { PDFParse } = await import("pdf-parse");
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
  const value = request.query?.path;
  if (value) {
    return (Array.isArray(value) ? value : String(value).split("/")).filter(Boolean);
  }

  const pathname = new URL(request.url || "/", "http://localhost").pathname;
  return pathname
    .replace(/^\/api(?:\/index)?\/?/, "")
    .split("/")
    .filter(Boolean);
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

    if (parts[0] === "auth" && parts[1] === "register" && request.method === "POST") {
      const user = await auth.register(request.body);
      await auth.recordEvent(user, "register", request);
      auth.setSession(response, user);
      return send(response, 201, { user });
    }
    if (parts[0] === "auth" && parts[1] === "login" && request.method === "POST") {
      const user = await auth.login(request.body);
      await auth.recordEvent(user, "login", request);
      auth.setSession(response, user);
      return send(response, 200, { user });
    }
    if (parts[0] === "auth" && parts[1] === "logout" && request.method === "POST") {
      const user = await auth.currentUser(request);
      await auth.recordEvent(user, "logout", request);
      auth.clearSession(response);
      return send(response, 204);
    }
    if (parts[0] === "auth" && parts[1] === "me" && request.method === "GET") {
      const user = await auth.currentUser(request);
      return send(response, 200, { user });
    }

    const user = await auth.requireUser(request);

    if (parts[0] === "admin") {
      await auth.requireAdmin(request);
      if (parts[1] === "users" && !parts[2] && request.method === "GET") {
        const users = await store.list("users");
        const analyses = await store.list("analyses");
        const events = await store.list("auth-events");
        return send(response, 200, users.map((record) => ({
          id: record.id,
          name: record.name,
          email: record.email,
          is_admin: auth.isAdminEmail(record.email),
          created_at: record.created_at,
          analysis_count: analyses.filter((analysis) => analysis.user_id === record.id).length,
          last_login_at: events.find((event) => event.user_id === record.id && event.event === "login")?.created_at || null,
        })));
      }
      if (parts[1] === "users" && parts[2] && !parts[3] && request.method === "GET") {
        const selectedUser = await store.get("users", parts[2]);
        if (!selectedUser) return send(response, 404, { detail: "User not found." });
        const analyses = (await store.list("analyses")).filter((record) => record.user_id === selectedUser.id);
        const events = (await store.list("auth-events")).filter((record) => record.user_id === selectedUser.id);
        const resumes = (await store.list("resumes")).filter((record) => record.user_id === selectedUser.id).map((record) => summary(record));
        return send(response, 200, {
          user: { id: selectedUser.id, name: selectedUser.name, email: selectedUser.email, created_at: selectedUser.created_at },
          analyses,
          events,
          resumes,
        });
      }
      if (parts[1] === "users" && parts[2] && parts[3] === "password" && request.method === "PATCH") {
        const selectedUser = await auth.resetPassword(parts[2], request.body.password);
        await auth.recordEvent(user, "admin_password_reset", request);
        return send(response, 200, { message: `Password updated for ${selectedUser.email}.` });
      }
      return send(response, 404, { detail: "Admin API route not found." });
    }

    if (parts[0] === "resumes" && parts[1] === "upload" && request.method === "POST") {
      const { file, extension, text } = await parseUpload(request);
      const record = await store.create("resumes", { user_id: user.id, original_filename: file.originalFilename, file_type: extension, file_size: file.size, extracted_text: text });
      return send(response, 201, { message: "Resume uploaded successfully.", resume: summary(record, true) });
    }
    if (parts[0] === "job-descriptions" && !parts[1] && request.method === "POST") {
      const jobTitle = String(request.body.job_title || "").trim();
      const description = String(request.body.description || "").trim();
      if (!jobTitle || description.length < 30) return send(response, 400, { detail: "A job title and detailed description are required." });
      return send(response, 201, await store.create("job-descriptions", { user_id: user.id, job_title: jobTitle, company_name: String(request.body.company_name || "").trim(), description, required_skills: extractSkills(description) }));
    }

    if (parts[0] === "analyses" && !parts[1] && request.method === "POST") {
      const resume = await store.get("resumes", request.body.resume_id);
      const job = await store.get("job-descriptions", request.body.job_description_id);
      if (!resume || !job || resume.user_id !== user.id || job.user_id !== user.id) return send(response, 400, { detail: "Resume or job description not found." });
      const result = analyze(resume, job);
      const record = await store.create("analyses", { ...result, user_id: user.id, resume_id: resume.id, job_description_id: job.id, resume: summary(resume), job_description: { id: job.id, job_title: job.job_title, company_name: job.company_name, required_skills: job.required_skills, created_at: job.created_at } });
      return send(response, 201, record);
    }
    if (parts[0] === "analyses" && !parts[1] && request.method === "GET") return send(response, 200, (await store.list("analyses")).filter((record) => record.user_id === user.id));
    if (parts[0] === "analyses" && parts[1]) {
      const analysis = await store.get("analyses", parts[1]);
      if (!analysis || analysis.user_id !== user.id) return send(response, 404, { detail: "Analysis not found." });
      if (request.method === "GET") return send(response, 200, analysis);
      if (request.method === "DELETE") { await store.remove("analyses", parts[1]); return send(response, 204); }
    }

    if (parts[0] === "built-resumes" && parts[2] === "prepare-analysis" && request.method === "POST") {
      const built = await store.get("built-resumes", parts[1]);
      if (!built || built.user_id !== user.id) return send(response, 404, { detail: "Built resume not found." });
      const text = resumeText(built);
      const resume = await store.create("resumes", { user_id: user.id, original_filename: `${built.full_name} Built Resume.docx`, file_type: "docx", file_size: Buffer.byteLength(text), extracted_text: text });
      const job = await store.create("job-descriptions", { user_id: user.id, job_title: request.body.job_title, company_name: request.body.company_name || "", description: request.body.description, required_skills: extractSkills(request.body.description) });
      return send(response, 201, { resume_id: resume.id, job_description_id: job.id, resume: summary(resume), job_description: job });
    }
    if (parts[0] === "built-resumes" && !parts[1] && request.method === "POST") {
      return send(response, 201, await store.create("built-resumes", { ...request.body, user_id: user.id }));
    }

    return send(response, 404, { detail: "API route not found." });
  } catch (error) {
    if (error instanceof auth.AuthError) return send(response, error.status, { detail: error.message });
    const clientError = /resume|PDF|DOCX|file|detailed|required/i.test(error.message);
    return send(response, clientError ? 400 : 503, { detail: error.message || "Request failed." });
  }
}
