import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  const hashedPassword = `${buf.toString("hex")}.${salt}`;
  console.log('Generated hash:', hashedPassword);
  return hashedPassword;
}

// Generate hash for 'vivajaponcabrones'
hashPassword('vivajaponcabrones').catch(console.error);
