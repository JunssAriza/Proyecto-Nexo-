import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { promisify } from 'node:util';
import { dirname, resolve } from 'node:path';

const scrypt = promisify(scryptCallback);
const defaultUsersFile = resolve(homedir(), '.sena-nexo', 'users.json');
const usersFile = process.env.NEXO_USERS_FILE
  ? resolve(process.env.NEXO_USERS_FILE)
  : defaultUsersFile;

function isStoredUser(user) {
  return Boolean(
    user &&
    typeof user.email === 'string' &&
    user.password &&
    user.password.algorithm === 'scrypt' &&
    typeof user.password.salt === 'string' &&
    typeof user.password.hash === 'string' &&
    user.perfil &&
    typeof user.perfil.nombre === 'string' &&
    typeof user.perfil.rol === 'string' &&
    typeof user.perfil.centro === 'string' &&
    typeof user.perfil.programa === 'string' &&
    typeof user.perfil.ficha === 'string' &&
    typeof user.perfil.jornada === 'string' &&
    Array.isArray(user.perfil.habilidades) &&
    user.perfil.habilidades.every(skill => typeof skill === 'string')
  );
}

export async function readUsers() {
  let contents;
  try {
    contents = await readFile(usersFile, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  const users = JSON.parse(contents);
  if (!Array.isArray(users) || !users.every(isStoredUser)) {
    throw new Error(`El archivo de usuarios no tiene un formato válido: ${usersFile}`);
  }
  return users;
}

export async function writeUsers(users) {
  await mkdir(dirname(usersFile), { recursive: true });
  const temporaryFile = `${usersFile}.${process.pid}.${randomBytes(6).toString('hex')}.tmp`;
  await writeFile(temporaryFile, `${JSON.stringify(users, null, 2)}\n`, { mode: 0o600 });
  await rename(temporaryFile, usersFile);
}

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt, 64);
  return {
    algorithm: 'scrypt',
    salt: salt.toString('hex'),
    hash: derivedKey.toString('hex')
  };
}

export async function verifyPassword(password, storedPassword) {
  if (storedPassword?.algorithm !== 'scrypt') {
    return false;
  }

  const salt = Buffer.from(storedPassword.salt, 'hex');
  const expectedHash = Buffer.from(storedPassword.hash, 'hex');
  if (salt.length !== 16 || expectedHash.length !== 64) {
    return false;
  }

  const actualHash = await scrypt(password, salt, expectedHash.length);
  return timingSafeEqual(actualHash, expectedHash);
}

export function publicUser(user) {
  return { email: user.email, perfil: user.perfil };
}

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function validateCredentials(email, password) {
  if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return 'Escribe un correo electrónico válido.';
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return 'La contraseña debe tener entre 8 y 128 caracteres.';
  }
  return null;
}

export function validateProfile(profile) {
  const fields = ['nombre', 'rol', 'centro', 'programa', 'ficha', 'jornada'];
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    return { error: 'Los datos del perfil no tienen un formato válido.' };
  }

  const cleanProfile = {};
  for (const field of fields) {
    if (typeof profile[field] !== 'string' || !profile[field].trim() || profile[field].trim().length > 200) {
      return { error: 'Completa los datos obligatorios del perfil (máximo 200 caracteres por campo).' };
    }
    cleanProfile[field] = profile[field].trim();
  }

  if (
    !Array.isArray(profile.habilidades) ||
    profile.habilidades.length > 30 ||
    profile.habilidades.some(skill => typeof skill !== 'string' || skill.trim().length > 50)
  ) {
    return { error: 'Las habilidades deben ser una lista de hasta 30 elementos de máximo 50 caracteres.' };
  }

  cleanProfile.habilidades = profile.habilidades.map(skill => skill.trim()).filter(Boolean);
  return { perfil: cleanProfile };
}
