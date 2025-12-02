import { compare, hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

export function generateVisitorId(): string {
  return `guest_${uuidv4().substring(0, 8)}`;
}

export function generateSessionToken(): string {
  return uuidv4();
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidDisplayName(name: string): boolean {
  if (name.length < 2 || name.length > 20) return false;
  const nameRegex = /^[a-zA-Z0-9\s]+$/;
  return nameRegex.test(name);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export interface PlayerSession {
  visitorId: string;
  oderId?: string;
  name: string;
  email?: string;
  isGuest: boolean;
}

export function createGuestSession(name: string): PlayerSession {
  return {
    visitorId: generateVisitorId(),
    name,
    isGuest: true,
  };
}

export function createUserSession(
  oderId: string,
  email: string,
  displayName: string
): PlayerSession {
  return {
    visitorId: `user_${oderId}`,
    oderId,
    name: displayName,
    email,
    isGuest: false,
  };
}
