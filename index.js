const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({
    auth: state,
    logger: P({level:'silent'}),
    printQRInTerminal: true,
    browser:["Ubuntu","Chrome","20.0.04"]
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({messages}) => {
    let m = messages[0];
    if(!m.message) return;
    let txt = m.message.conversation || m.message.extendedTextMessage?.text || "";
    console.log('Mesaj: '+txt);
    if(!txt.startsWith(".")) return;
    let cmd = txt.slice(1).toLowerCase().trim();

    if(cmd == 'menu' || cmd == 'meniu' || cmd == 'meni') {
      await sock.sendMessage(m.key.remoteJid, { text: `👑 *MORTEX ULTRA BOT* 👑\n\n✅ Bot Online!\n\nComenzi:\n.menu\n.ping\n.owner\nCreator: Cosmin` });
      console.log('MENIU TRIMIS!');
    }
    if(cmd == 'ping') {
      await sock.sendMessage(m.key.remoteJid, { text: 'Pong! 🏓 Botul e viu!' });
    }
  });

  sock.ev.on('connection.update', u => {
    if(u.qr) console.log('SCANEAZA QR-UL DIN LOGS!');
    if(u.connection=='open') console.log('✅ BOT ONLINE - SCRIE.menu ACUM!');
    if(u.connection=='close') start();
  });
}
start();
