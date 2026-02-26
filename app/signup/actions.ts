"use server";

import { db } from "../lib/db";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import isEmail from "validator/lib/isEmail";

type SignupState = {
  error?: string;
};

const ALLOWED_DOMAINS = [
  "gmail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "yahoo.com",
  "yahoo.co.uk",
  "yahoo.co.in",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
  "msn.com",
  "googlemail.com",
];

export async function signupAction(
  prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const email = formData.get("email")?.toString().toLowerCase().trim();
  const password = formData.get("password")?.toString();

  // Required check
  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Email format check using validator
  if (!isEmail(email)) {
    return { error: "Please enter a valid email address" };
  }

  // Whitelist check — only allow real email providers
  const domain = email.split("@")[1];
  if (!ALLOWED_DOMAINS.includes(domain)) {
    return { error: "Please use a valid email provider (e.g. Gmail, Outlook, Yahoo)" };
  }

  // Password length check
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  // Duplicate check
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const hashed = await bcrypt.hash(password, 10);

  await db.user.create({
    data: { email, password: hashed },
  });

  redirect("/login");
}