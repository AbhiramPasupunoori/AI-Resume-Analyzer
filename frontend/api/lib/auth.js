import {
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

import * as store from "./githubStore.js";

const scrypt = promisify(scryptCallback);
const COOKIE_NAME = "resume_analyzer_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.status = status;
  }
}

function sessionSecret() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (secret?.length >= 32) return secret;
  if (process.env.LOCAL_JSON_STORAGE === "true") {
    return "local-development-secret-change-before-deploying";
  }
  throw new AuthError("AUTH_SECRET must be configured with at least 32 characters.", 503);
}

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(payload) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function cookies(request) {
  return Object.fromEntries(
    String(request.headers.cookie || "")
      .split(";")
      .map((part) => part.trim().split(/=(.*)/s))
      .filter(([name]) => name)
      .map(([name, value]) => [decodeURIComponent(name), decodeURIComponent(value || "")])
  );
}

function adminEmails() {
  return new Set(
    String(process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdminEmail(email) {
  return adminEmails().has(String(email || "").toLowerCase());
}

function publicUser(user) {
  const value = {
    id: user.id,
    name: user.name,
    email: user.email,
    is_admin: isAdminEmail(user.email),
    created_at: user.created_at,
  };
  Object.defineProperty(value, "session_version", { value: user.session_version || 1 });
  return value;
}

async function passwordHash(password, salt) {
  return Buffer.from(await scrypt(password, salt, 64)).toString("hex");
}

async function verifyPassword(password, user) {
  const actual = Buffer.from(await passwordHash(password, user.password_salt), "hex");
  const expected = Buffer.from(user.password_hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function validateRegistration({ name, email, password }) {
  if (name.length < 2 || name.length > 80) throw new AuthError("Name must be between 2 and 80 characters.", 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AuthError("Enter a valid email address.", 400);
  if (password.length < 8) throw new AuthError("Password must be at least 8 characters.", 400);
}

function validatePassword(password) {
  if (password.length < 8) throw new AuthError("Password must be at least 8 characters.", 400);
}

export async function register(body) {
  sessionSecret();
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  validateRegistration({ name, email, password });

  if (await store.findBy("users", "email", email)) {
    throw new AuthError("An account with this email already exists.", 409);
  }

  const salt = randomBytes(16).toString("hex");
  const user = await store.create("users", {
    name,
    email,
    password_salt: salt,
    password_hash: await passwordHash(password, salt),
    session_version: 1,
  });
  return publicUser(user);
}

export async function login(body) {
  sessionSecret();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const user = await store.findBy("users", "email", email);
  if (!user || !(await verifyPassword(password, user))) {
    throw new AuthError("Invalid email or password.");
  }
  return publicUser(user);
}

export async function recordEvent(user, event, request) {
  if (!user) return null;
  const forwardedFor = String(request.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return store.create("auth-events", {
    user_id: user.id,
    event,
    ip_address: forwardedFor || String(request.socket?.remoteAddress || "unknown"),
    user_agent: String(request.headers["user-agent"] || "unknown").slice(0, 300),
  });
}

export async function resetPassword(userId, password) {
  const value = String(password || "");
  validatePassword(value);
  const user = await store.get("users", userId);
  if (!user) throw new AuthError("User not found.", 404);
  const salt = randomBytes(16).toString("hex");
  const updatedUser = await store.update("users", user.id, {
    password_salt: salt,
    password_hash: await passwordHash(value, salt),
    session_version: (user.session_version || 1) + 1,
  });
  return publicUser(updatedUser);
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await store.get("users", userId);
  if (!user || !(await verifyPassword(String(currentPassword || ""), user))) {
    throw new AuthError("Current password is incorrect.", 400);
  }
  return resetPassword(user.id, newPassword);
}

export async function changePasswordWithCredentials(email, currentPassword, newPassword) {
  const user = await store.findBy("users", "email", String(email || "").trim().toLowerCase());
  if (!user || !(await verifyPassword(String(currentPassword || ""), user))) {
    throw new AuthError("Email or current password is incorrect.", 400);
  }
  return resetPassword(user.id, newPassword);
}

export function setSession(response, user) {
  const payload = encode({ userId: user.id, sessionVersion: user.session_version || 1, expiresAt: Date.now() + SESSION_SECONDS * 1000 });
  const token = `${payload}.${sign(payload)}`;
  const secure = process.env.LOCAL_JSON_STORAGE === "true" ? "" : "; Secure";
  response.setHeader("Set-Cookie", `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_SECONDS}${secure}`);
}

export function clearSession(response) {
  const secure = process.env.LOCAL_JSON_STORAGE === "true" ? "" : "; Secure";
  response.setHeader("Set-Cookie", `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`);
}

export async function currentUser(request) {
  const token = cookies(request)[COOKIE_NAME];
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!session.userId || session.expiresAt <= Date.now()) return null;
    const user = await store.get("users", session.userId);
    if ((user?.session_version || 1) !== session.sessionVersion) return null;
    return user ? publicUser(user) : null;
  } catch {
    return null;
  }
}

export async function requireUser(request) {
  const user = await currentUser(request);
  if (!user) throw new AuthError("Please log in to continue.");
  return user;
}

export async function requireAdmin(request) {
  const user = await requireUser(request);
  if (!user.is_admin) throw new AuthError("Administrator access is required.", 403);
  return user;
}
