import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { hashPassword, normalizeEmail, readUsers, writeUsers } from './users.js';

function help() {
  console.log(`Administración local de cuentas:
  node backend/manage-users.js list [texto]
  node backend/manage-users.js reset-password <correo>
  node backend/manage-users.js delete <correo>

Para editar un perfil, modifica el campo "perfil" de esa cuenta en backend/data/users.json
con el servidor detenido. No modifiques el hash de contraseña manualmente.`);
}

function askHidden(prompt) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    throw new Error('El cambio de contraseña debe ejecutarse desde una terminal interactiva.');
  }

  return new Promise((resolve, reject) => {
    let secret = '';
    stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();

    function finish(error) {
      stdin.off('data', onData);
      stdin.setRawMode(false);
      stdout.write('\n');
      if (error) {
        reject(error);
      } else {
        resolve(secret);
      }
    }

    function onData(buffer) {
      for (const character of buffer.toString('utf8')) {
        if (character === '\u0003') {
          finish(new Error('Operación cancelada.'));
          return;
        }
        if (character === '\r' || character === '\n') {
          finish();
          return;
        }
        if (character === '\u007f' || character === '\b') {
          secret = secret.slice(0, -1);
        } else {
          secret += character;
        }
      }
    }

    stdin.on('data', onData);
  });
}

async function main() {
  const [command, argument] = process.argv.slice(2);
  if (!command || command === 'help' || command === '--help') {
    help();
    return;
  }

  const users = await readUsers();
  if (command === 'list') {
    const query = (argument ?? '').toLowerCase();
    const matches = users.filter(user =>
      `${user.email} ${user.perfil.nombre} ${user.perfil.programa}`.toLowerCase().includes(query)
    );
    if (matches.length === 0) {
      console.log('No se encontraron cuentas.');
      return;
    }
    for (const user of matches) {
      console.log(`${user.email} | ${user.perfil.nombre} | ${user.perfil.programa}`);
    }
    return;
  }

  if (command === 'reset-password' && argument) {
    const email = normalizeEmail(argument);
    const user = users.find(account => account.email === email);
    if (!user) {
      throw new Error(`No existe una cuenta con el correo ${email}.`);
    }

    const password = await askHidden('Nueva contraseña (8-128 caracteres): ');
    if (password.length < 8 || password.length > 128) {
      throw new Error('La contraseña debe tener entre 8 y 128 caracteres.');
    }
    const confirmation = await askHidden('Confirma la nueva contraseña: ');
    if (password !== confirmation) {
      throw new Error('Las contraseñas no coinciden.');
    }

    user.password = await hashPassword(password);
    await writeUsers(users);
    console.log(`Contraseña actualizada para ${email}.`);
    return;
  }

  if (command === 'delete' && argument) {
    const email = normalizeEmail(argument);
    const index = users.findIndex(account => account.email === email);
    if (index === -1) {
      throw new Error(`No existe una cuenta con el correo ${email}.`);
    }

    const prompt = createInterface({ input: stdin, output: stdout });
    const confirmation = await prompt.question(`¿Eliminar la cuenta ${email}? Escribe "si" para confirmar: `);
    prompt.close();
    if (confirmation.trim().toLowerCase() !== 'si') {
      console.log('Operación cancelada.');
      return;
    }

    users.splice(index, 1);
    await writeUsers(users);
    console.log(`Cuenta ${email} eliminada.`);
    return;
  }

  help();
  throw new Error('Comando o argumentos no válidos.');
}

main().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
