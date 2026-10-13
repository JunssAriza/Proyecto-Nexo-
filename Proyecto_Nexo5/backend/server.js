import { randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  hashPassword,
  normalizeEmail,
  publicUser,
  readUsers,
  validateCredentials,
  validateProfile,
  verifyPassword,
  writeUsers
} from './users.js';

const projectRoot = resolve(import.meta.dirname, '..');
const distDirectory = resolve(projectRoot, 'dist');
const sessionCookie = 'nexo_session';
const sessionLifetimeMs = 7 * 24 * 60 * 60 * 1000;
const sessions = new Map();
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};
let userMutationQueue = Promise.resolve();

function serializeUserMutation(operation) {
  const result = userMutationQueue.then(operation);
  userMutationQueue = result.catch(() => {});
  return result;
}

function sendJson(response, status, data, headers = {}) {
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  response.end(JSON.stringify(data));
}

function sessionCookieHeader(request, value, maxAge) {
  const secure = request.socket.encrypted || request.headers['x-forwarded-proto'] === 'https'
    ? '; Secure'
    : '';
  return `${sessionCookie}=${value}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=${maxAge}${secure}`;
}

function getSessionToken(request) {
  const cookieHeader = request.headers.cookie ?? '';
  const cookie = cookieHeader.split(';').map(value => value.trim())
    .find(value => value.startsWith(`${sessionCookie}=`));
  return cookie?.slice(sessionCookie.length + 1);
}

async function getSessionUser(request) {
  const token = getSessionToken(request);
  const session = token ? sessions.get(token) : null;

  if (!session || session.expiresAt <= Date.now()) {
    if (token) {
      sessions.delete(token);
    }
    return null;
  }

  const users = await readUsers();
  const user = users.find(account => account.email === session.email);
  if (!user || user.password.hash !== session.passwordHash) {
    sessions.delete(token);
    return null;
  }
  return { token, email: session.email, passwordHash: session.passwordHash, user };
}

async function readJsonBody(request) {
  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > 64 * 1024) {
      const error = new Error('La solicitud es demasiado grande.');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  try {
    const data = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('El cuerpo JSON debe ser un objeto.');
    }
    return data;
  } catch {
    const error = new Error('El cuerpo de la solicitud debe ser JSON válido.');
    error.status = 400;
    throw error;
  }
}

async function handleApi(request, response, pathname) {
  if (request.method === 'GET' && pathname === '/api/health') {
    sendJson(response, 200, { status: 'ok' });
    return;
  }

  if (request.method === 'GET' && pathname === '/api/me') {
    const session = await getSessionUser(request);
    sendJson(response, 200, { usuario: session ? publicUser(session.user) : null });
    return;
  }

  if (request.method === 'POST' && pathname === '/api/register') {
    const data = await readJsonBody(request);
    const credentialError = validateCredentials(data.email, data.contrasena);
    const { perfil, error: profileError } = validateProfile(data.perfil);
    if (credentialError || profileError) {
      sendJson(response, 400, { error: credentialError || profileError });
      return;
    }

    const email = normalizeEmail(data.email);
    const user = await serializeUserMutation(async () => {
      const users = await readUsers();
      if (users.some(account => account.email === email)) {
        return null;
      }
      const newUser = {
        email,
        password: await hashPassword(data.contrasena),
        perfil
      };
      await writeUsers([...users, newUser]);
      return newUser;
    });

    if (!user) {
      sendJson(response, 409, { error: 'Ya existe una cuenta registrada con ese correo.' });
      return;
    }
    sendJson(response, 201, { usuario: publicUser(user) });
    return;
  }

  if (request.method === 'POST' && pathname === '/api/login') {
    const data = await readJsonBody(request);
    if (
      typeof data.email !== 'string' ||
      typeof data.contrasena !== 'string' ||
      data.contrasena.length > 128
    ) {
      sendJson(response, 400, { error: 'Escribe el correo y la contraseña.' });
      return;
    }

    const email = normalizeEmail(data.email);
    const users = await readUsers();
    const user = users.find(account => account.email === email);
    const passwordMatches = user
      ? await verifyPassword(data.contrasena, user.password)
      : false;

    if (!user || !passwordMatches) {
      sendJson(response, 401, { error: 'Correo o contraseña incorrectos.' });
      return;
    }

    const token = randomBytes(32).toString('hex');
    sessions.set(token, {
      email: user.email,
      passwordHash: user.password.hash,
      expiresAt: Date.now() + sessionLifetimeMs
    });
    sendJson(response, 200, { usuario: publicUser(user) }, {
      'Set-Cookie': sessionCookieHeader(request, token, sessionLifetimeMs / 1000)
    });
    return;
  }

  if (request.method === 'POST' && pathname === '/api/logout') {
    const token = getSessionToken(request);
    if (token) {
      sessions.delete(token);
    }
    sendJson(response, 200, { ok: true }, {
      'Set-Cookie': sessionCookieHeader(request, '', 0)
    });
    return;
  }

  if (request.method === 'PUT' && pathname === '/api/profile') {
    const session = await getSessionUser(request);
    if (!session) {
      sendJson(response, 401, { error: 'Inicia sesión para actualizar tu perfil.' });
      return;
    }

    const data = await readJsonBody(request);
    const { perfil, error } = validateProfile(data);
    if (error) {
      sendJson(response, 400, { error });
      return;
    }

    const updatedUser = await serializeUserMutation(async () => {
      const users = await readUsers();
      const index = users.findIndex(account => account.email === session.email);
      if (index === -1 || users[index].password.hash !== session.passwordHash) {
        return null;
      }
      users[index] = { ...users[index], perfil };
      await writeUsers(users);
      return users[index];
    });

    if (!updatedUser) {
      sessions.delete(session.token);
      sendJson(response, 401, { error: 'La cuenta ya no existe. Inicia sesión de nuevo.' });
      return;
    }
    sendJson(response, 200, { usuario: publicUser(updatedUser) });
    return;
  }

  sendJson(response, 404, { error: 'No se encontró la ruta solicitada.' });
}

async function serveStaticFile(request, response, pathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    sendJson(response, 400, { error: 'La ruta solicitada no es válida.' });
    return;
  }

  const candidate = resolve(distDirectory, `.${decodedPath}`);
  if (candidate !== distDirectory && !candidate.startsWith(`${distDirectory}${sep}`)) {
    sendJson(response, 404, { error: 'No se encontró el archivo solicitado.' });
    return;
  }

  const targets = [candidate, resolve(distDirectory, 'index.html')];
  for (const target of targets) {
    try {
      const contents = await readFile(target);
      response.writeHead(200, {
        'Cache-Control': target.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
        'Content-Type': mimeTypes[extname(target).toLowerCase()] || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff'
      });
      response.end(request.method === 'HEAD' ? undefined : contents);
      return;
    } catch (error) {
      if (error.code !== 'ENOENT' && error.code !== 'EISDIR') {
        throw error;
      }
    }
  }

  sendJson(response, 503, { error: 'Primero compila la aplicación con npm run build.' });
}

export async function startApiServer({ host = process.env.HOST || '127.0.0.1', port = Number(process.env.PORT || 3001) } = {}) {
  await readUsers();
  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    const handler = requestUrl.pathname.startsWith('/api/')
      ? handleApi(request, response, requestUrl.pathname)
      : request.method === 'GET' || request.method === 'HEAD'
        ? serveStaticFile(request, response, requestUrl.pathname)
        : Promise.resolve(sendJson(response, 405, { error: 'Método no permitido.' }));

    handler.catch(error => {
      console.error('Error atendiendo solicitud:', error);
      if (!response.headersSent) {
        sendJson(response, error.status || 500, {
          error: error.status ? error.message : 'Ocurrió un error interno del servidor.'
        });
      } else {
        response.destroy(error);
      }
    });
  });

  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(port, host, () => {
      server.removeListener('error', rejectListen);
      resolveListen();
    });
  });
  console.log(`Servidor SENA NEXO disponible en http://${host}:${port}`);
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  startApiServer().catch(error => {
    console.error('No se pudo iniciar el servidor:', error);
    process.exitCode = 1;
  });
}
