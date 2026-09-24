#!/usr/bin/env node
/**
 * Report what this deployment actually sees. Run it the same way the app runs:
 *   sudo DATA_DIR=/var/lib/4xcms node scripts/doctor.mjs
 * Prints no passwords or hashes.
 */
import fs from "node:fs";
import path from "node:path";

const line = (k, v) => console.log(`  ${k.padEnd(22)} ${v}`);
const yes = (b) => (b ? "yes" : "NO");

console.log("\n4XCMS deployment check\n" + "=".repeat(50));

console.log("\nEnvironment as this process sees it:");
line("PLATFORM_HOSTS", process.env.PLATFORM_HOSTS ? `"${process.env.PLATFORM_HOSTS}"` : "(not set — every hostname serves the store)");
line("DATA_DIR", process.env.DATA_DIR ?? "(not set — using ./.data)");
line("ADMIN_EMAIL", process.env.ADMIN_EMAIL ?? "(not set)");
line("ADMIN_PASSWORD", process.env.ADMIN_PASSWORD ? "(set — seeds the FIRST admin only)" : "(not set)");
line("NODE_ENV", process.env.NODE_ENV ?? "(not set)");

const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

console.log("\nData directory:");
line("resolved to", DATA_DIR);
line("exists", yes(fs.existsSync(DATA_DIR)));
line("database file", fs.existsSync(DB_FILE) ? DB_FILE : "MISSING (created on first write)");
if (fs.existsSync(DATA_DIR)) {
  try {
    fs.accessSync(DATA_DIR, fs.constants.W_OK);
    line("writable", "yes");
  } catch {
    line("writable", "NO — the app cannot save anything here");
  }
}

if (!fs.existsSync(DB_FILE)) {
  console.log("\nNo database yet. The first admin will be seeded from ADMIN_EMAIL/ADMIN_PASSWORD");
  console.log("the first time /admin/login is opened.\n");
  process.exit(0);
}

const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
const admins = db.admins ?? [];
console.log("\nAdmin accounts in the database:");
if (!admins.length) {
  console.log("  (none — ADMIN_EMAIL/ADMIN_PASSWORD will seed one on the next visit to /admin/login)");
} else {
  for (const a of admins) line(a.email, `${a.role}, last login ${a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString() : "never"}`);
  const envEmail = process.env.ADMIN_EMAIL;
  console.log("\n  NOTE: an admin already exists, so ADMIN_EMAIL/ADMIN_PASSWORD are IGNORED.");
  console.log("  Setting them in your hosting panel will not change this password. To change it:");
  console.log(`    sudo DATA_DIR=${DATA_DIR} node scripts/set-admin.mjs ${envEmail ?? admins[0].email} '<new-password>'`);
  console.log("    sudo systemctl restart 4xcms");
  if (envEmail && !admins.some((a) => a.email.toLowerCase() === envEmail.toLowerCase())) {
    console.log(`\n  WARNING: ADMIN_EMAIL is "${envEmail}" but no admin has that address.`);
    console.log("  You are probably signing in with the wrong email — use one listed above.");
  }
}

console.log("\nContent:");
line("tenants", String((db.tenants ?? []).length));
line("users", String((db.users ?? []).length));
line("custom themes", String((db.themes ?? []).length));
line("admin sessions", String((db.sessions ?? []).filter((s) => s.kind === "admin").length));
console.log("");
