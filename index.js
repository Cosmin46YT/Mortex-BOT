const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');

const MY_SESSION = "Mortex~PUNE_CODUL_TAU_AICI";
if (MY_SESSION.includes("Mortex~")) {
  try {
    if (!fs.existsSync('./auth')) fs.mkdirSync('./auth');
    let s = MY_SESSION.replace('Mortex~','').replace('MORTEX~','');
    fs.writeFileSync('./auth/creds.json', Buffer.from(s, 'base64').toString('utf-8'));
    console.log('✅ SESSION_ID OK');
  } catch(e){ console.log(e) }
}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({ auth: state, logger: P({level:'silent'}), browser:["Ubuntu","Chrome","20.0.04"] });
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({messages}) => {
    const m = messages[0]; if(!m.message) return;
    let txt = m.message.conversation || m.message.extendedTextMessage?.text || "";
    if(!txt.startsWith(".")) return;
    let cmd = txt.slice(1).split(" ")[0].toLowerCase();

    // INCARCA PLUGINUL menu.js
    try {
      const pluginPath = path.join(__dirname, 'plugins', 'menu.js');
      if (fs.existsSync(pluginPath)) {
        delete require.cache[require.resolve(pluginPath)];
        const handler = require(pluginPath);
        if (handler.command && handler.command.includes(cmd)) {
          await handler(m, { conn: sock });
          console.log(`Comanda executata: ${cmd}`);
        }
      }
    } catch(e){ console.log('Eroare menu: '+e.message) }
  });

  sock.ev.on('connection.update', u => {
    if(u.connection=='open') console.log('BOT ONLINE cu menu ✅');
    if(u.connection=='close') start();
  });
}
start();
