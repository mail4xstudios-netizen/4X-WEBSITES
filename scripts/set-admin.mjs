#!/usr/bin/env node
/**
 * Set (or create) a super-admin account's password directly in the database.
 *
 *   node scripts/set-admin.mjs <email> [password]
 *
 * With no password, one is generated. Env vars ADMIN_EMAIL / ADMIN_PASSWORD only ever
 * seed the very first admin, so this is the way to change a password afterwards —
 * or to recover access if it is lost. Existing admin sessions are ended.
 *
 * Honours DATA_DIR, so on a server run it the same way the app runs:
 *   DATA_DIR=/var/lib/4xcms node scripts/set-admin.mjs you@example.com 'NewPass123'
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const [, , emailArg, passwordArg] = process.argv;
if (!emailArg) {
  console.error("Usage: node scripts/set-admin.mjs <email> [password]");
  process.exit(1);
}
const email = emailArg.trim();
const password = passwordArg ?? crypto.randomBytes(12).toString("base64url");
const generated = !passwordArg;

if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
  console.error("Password must be at least 8 characters and include a letter and a number.");
  process.exit(1);
}

const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");
if (!fs.existsSync(DB_FILE)) {
  console.error(`No database at ${DB_FILE}.`);
  console.error("Set DATA_DIR to the directory the app uses, e.g. DATA_DIR=/var/lib/4xcms");
  process.exit(1);
}

// Must match hashPassword() in src/lib/auth.ts
const salt = crypto.randomBytes(16).toString("hex");
const hash = crypto.scryptSync(password, salt, 64, { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString("hex");

const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
db.admins ??= [];
db.sessions ??= [];

let admin = db.admins.find((a) => a.email.toLowerCase() === email.toLowerCase());
const created = !admin;
if (admin) {
  admin.passwordHash = `scrypt$${salt}$${hash}`;
} else {
  admin = { id: "adm_" + crypto.randomBytes(6).toString("hex"), name: "4X Super Admin", email, passwordHash: `scrypt$${salt}$${hash}`, role: "superadmin", createdAt: new Date().toISOString() };
  db.admins.push(admin);
}
// End that admin's existing sessions so an old cookie cannot outlive the change.
db.sessions = db.sessions.filter((s) => !(s.kind === "admin" && s.subjectId === admin.id));

fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

console.log(`${created ? "Created" : "Updated"} super admin: ${email}`);
if (generated) console.log(`Generated password: ${password}`);
else console.log("Password set from the value you passed.");
console.log(`Admins in database: ${db.admins.map((a) => a.email).join(", ")}`);
console.log("Restart the app so it reloads the database:  systemctl restart 4xcms");
