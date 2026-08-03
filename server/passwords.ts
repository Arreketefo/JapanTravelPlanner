import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { PublicUser, User } from "@shared/schema";

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${hash}.${salt}`;
}

export function comparePasswords(supplied: string, stored: string): boolean {
  const [hashHex, salt, ...extra] = stored.split(".");
  if (!hashHex || !salt || extra.length > 0) return false;

  let expected: Buffer;
  try {
    expected = Buffer.from(hashHex, "hex");
  } catch {
    return false;
  }
  if (expected.length !== KEY_LENGTH) return false;

  const actual = scryptSync(supplied, salt, KEY_LENGTH);
  return timingSafeEqual(expected, actual);
}

export function toPublicUser(user: User): PublicUser {
  return { id: user.id, username: user.username };
}
