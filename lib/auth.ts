import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "change-me-in-production-must-be-32-chars!!"
);
const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(SECRET);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function getSession(): Promise<{ userId: string } | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { userId: string };
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  return session;
}
