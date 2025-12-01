import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const SALT_ROUNDS = 10;
const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function createSessionToken(userId: string): string {
  const timestamp = Date.now();
  const data = `${userId}:${timestamp}`;
  return Buffer.from(data).toString("base64");
}

export function parseSessionToken(token: string): { userId: string; timestamp: number } | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [userId, timestampStr] = decoded.split(":");
    const timestamp = parseInt(timestampStr, 10);
    
    if (!userId || isNaN(timestamp)) {
      return null;
    }
    
    return { userId, timestamp };
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string): Promise<void> {
  const token = createSessionToken(userId);
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!token) {
    return null;
  }
  
  const parsed = parseSessionToken(token);
  if (!parsed) {
    return null;
  }
  
  // Check if session is expired (7 days)
  const now = Date.now();
  const sessionAge = now - parsed.timestamp;
  if (sessionAge > SESSION_MAX_AGE * 1000) {
    return null;
  }
  
  return parsed.userId;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

export function validateDisplayName(displayName: string): boolean {
  return displayName.length >= 2 && displayName.length <= 20;
}

export function calculatePoints(currentPoints: number, isWin: boolean): number {
  if (isWin) {
    return currentPoints + 10;
  }
  return Math.max(0, currentPoints - 10);
}
