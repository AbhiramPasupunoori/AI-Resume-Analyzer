import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const API = "https://api.github.com";

export class StoreError extends Error {}

function config() {
  const token = process.env.GITHUB_TOKEN?.trim();
  const repository = (process.env.GITHUB_REPOSITORY || process.env.VERCEL_GIT_REPO_SLUG)?.trim();
  const owner = process.env.GITHUB_REPOSITORY_OWNER || process.env.VERCEL_GIT_REPO_OWNER;
  const fullRepository = repository?.includes("/") ? repository : owner && repository ? `${owner}/${repository}` : "";
  if (!token || !fullRepository) {
    throw new StoreError("GITHUB_TOKEN and GITHUB_REPOSITORY (owner/repo) are required.");
  }
  return {
    token,
    repository: fullRepository,
    branch: process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "main",
    path: (process.env.GITHUB_DATA_PATH || "data").replace(/^\/+|\/+$/g, ""),
  };
}

async function github(url, options = {}) {
  const { token } = config();
  const response = await fetch(`${API}${url}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return response;
}

function fileUrl(collection) {
  const { repository, path } = config();
  return `/repos/${repository}/contents/${path}/${collection}.json`;
}

async function readCollection(collection) {
  if (process.env.LOCAL_JSON_STORAGE === "true") {
    const directory = process.env.LOCAL_DATA_DIR || path.resolve(process.cwd(), "../data");
    try {
      const records = JSON.parse(await readFile(path.join(directory, `${collection}.json`), "utf8"));
      if (!Array.isArray(records)) throw new StoreError(`${collection}.json must contain an array.`);
      return { records, sha: null };
    } catch (error) {
      if (error.code === "ENOENT") return { records: [], sha: null };
      throw error;
    }
  }

  const { branch } = config();
  const response = await github(`${fileUrl(collection)}?ref=${encodeURIComponent(branch)}`);
  if (response.status === 404) return { records: [], sha: null };
  if (!response.ok) throw new StoreError(`GitHub read failed: ${response.status} ${(await response.json()).message}`);
  const payload = await response.json();
  const records = JSON.parse(Buffer.from(payload.content.replace(/\n/g, ""), "base64").toString("utf8"));
  if (!Array.isArray(records)) throw new StoreError(`${collection}.json must contain an array.`);
  return { records, sha: payload.sha };
}

async function writeCollection(collection, records, sha, message) {
  if (process.env.LOCAL_JSON_STORAGE === "true") {
    const directory = process.env.LOCAL_DATA_DIR || path.resolve(process.cwd(), "../data");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, `${collection}.json`), `${JSON.stringify(records, null, 2)}\n`);
    return true;
  }

  const { branch } = config();
  const body = {
    message: `${message} [skip vercel]`,
    branch,
    content: Buffer.from(`${JSON.stringify(records, null, 2)}\n`).toString("base64"),
  };
  if (sha) body.sha = sha;
  const response = await github(fileUrl(collection), { method: "PUT", body: JSON.stringify(body) });
  if (response.status === 409) return false;
  if (!response.ok) throw new StoreError(`GitHub write failed: ${response.status} ${(await response.json()).message}`);
  return true;
}

async function mutate(collection, mutation, message) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { records, sha } = await readCollection(collection);
    const result = mutation(records);
    if (await writeCollection(collection, records, sha, message)) return result;
  }
  throw new StoreError("The JSON file changed concurrently. Please retry.");
}

export async function list(collection) {
  const { records } = await readCollection(collection);
  return records.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

export async function get(collection, id) {
  const { records } = await readCollection(collection);
  return records.find((record) => record.id === Number(id)) || null;
}

export async function create(collection, values) {
  return mutate(collection, (records) => {
    const now = new Date().toISOString();
    const id = Math.max(0, ...records.map((record) => Number(record.id) || 0)) + 1;
    const record = { id, ...values, created_at: now, updated_at: now };
    records.push(record);
    return record;
  }, `data: add ${collection}`);
}

export async function remove(collection, id) {
  return mutate(collection, (records) => {
    const index = records.findIndex((record) => record.id === Number(id));
    if (index < 0) return false;
    records.splice(index, 1);
    return true;
  }, `data: delete ${collection}`);
}

export async function health() {
  if (process.env.LOCAL_JSON_STORAGE === "true") {
    return { repository: "local filesystem", branch: "development" };
  }

  const { repository, branch } = config();
  const response = await github(`/repos/${repository}`);
  if (!response.ok) throw new StoreError(`GitHub access failed with status ${response.status}.`);
  return { repository, branch };
}
