"use server";

import { db } from "../lib/db";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import isEmail from "validator/lib/isEmail";

type SignupState = {
  error?: string;
};

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