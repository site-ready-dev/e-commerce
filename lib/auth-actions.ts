"use server";

import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { createSession, deleteSession } from "./auth";
import { sendEmail } from "./email";
import { redirect } from "next/navigation";

function randomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ── First-time setup ─────────────────────────────────────────────────────────

export async function setupAdmin(prevState: string | null, formData: FormData) {
  const name = (formData.get("name") as string).trim();
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;
  const storeName = (formData.get("storeName") as string).trim() || "My Store";
  const whatsapp = (formData.get("whatsapp") as string).trim() || undefined;

  if (!name || !email || !password) return "All fields are required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password !== confirm) return "Passwords don't match.";

  const existing = await prisma.adminUser.count();
  if (existing > 0) return "Setup already complete.";

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.adminUser.create({
    data: { name, email, passwordHash },
  });

  // Initialise store settings
  const settings = await prisma.storeSettings.findFirst({ orderBy: { createdAt: "asc" } });
  if (settings) {
    await prisma.storeSettings.update({
      where: { id: settings.id },
      data: { storeName, ...(whatsapp ? { whatsappNumber: whatsapp } : {}) },
    });
  } else {
    await prisma.storeSettings.create({
      data: { storeName, ...(whatsapp ? { whatsappNumber: whatsapp } : {}) },
    });
  }

  await createSession(admin.id);
  redirect("/admin");
}

// ── Login ────────────────────────────────────────────────────────────────────

export async function loginAdmin(prevState: string | null, formData: FormData) {
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) return "Email and password are required.";

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) return "Invalid email or password.";

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return "Invalid email or password.";

  await createSession(admin.id);
  redirect("/admin");
}

// ── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAdmin() {
  await deleteSession();
  redirect("/auth/login");
}

// ── Forgot password ──────────────────────────────────────────────────────────

export async function requestPasswordReset(
  prevState: { error?: string; success?: string; email?: string } | null,
  formData: FormData
) {
  const email = (formData.get("email") as string).trim().toLowerCase();
  if (!email) return { error: "Email is required." };

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  // Always return success to prevent email enumeration
  if (!admin) return { success: "If that email exists, a code was sent.", email };

  // Invalidate previous codes
  await prisma.otpCode.updateMany({
    where: { email, used: false },
    data: { used: true },
  });

  const otp = randomOtp();
  const codeHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await prisma.otpCode.create({ data: { email, codeHash, expiresAt } });

  await sendEmail({
    to: email,
    subject: "Your password reset code",
    html: `
      <div style="font-family:sans-serif;max-width:420px;margin:0 auto;padding:32px 24px">
        <h2 style="font-size:18px;font-weight:700;margin-bottom:8px">Password reset</h2>
        <p style="color:#6b7280;margin-bottom:24px">Enter this code to reset your password. It expires in 10 minutes.</p>
        <div style="text-align:center;padding:20px;background:#f3f4f6;border-radius:12px;font-size:36px;font-weight:700;letter-spacing:10px">
          ${otp}
        </div>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  return { success: "A 6-digit code was sent to your email.", email };
}

// ── Reset password ───────────────────────────────────────────────────────────

export async function resetPassword(prevState: string | null, formData: FormData) {
  const email = (formData.get("email") as string).trim().toLowerCase();
  const otp = (formData.get("otp") as string).trim();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!email || !otp || !password) return "All fields are required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password !== confirm) return "Passwords don't match.";

  const record = await prisma.otpCode.findFirst({
    where: { email, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return "Code is invalid or expired.";

  const valid = await bcrypt.compare(otp, record.codeHash);
  if (!valid) return "Code is invalid or expired.";

  await prisma.otpCode.update({ where: { id: record.id }, data: { used: true } });

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.update({ where: { email }, data: { passwordHash } });

  redirect("/auth/login?reset=1");
}
