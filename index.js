const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({
    auth: state,
    logger: P({level:'silent'}),
    printQRInTerminal: false,
    browser:["Ubuntu","Chrome","20.0.04"]
  });

  sock.ev.on('creds.update', saveCreds);

  // AICI PUI NUMARUL TAU FARA + SI FARA SPATII
  const NUMARUL_TAU = "40770811929";

  if(!sock.authState.creds.registered) {
    setTimeout(async () => {
      try {
        let code = await sock.requestPairingCode(NUMARUL_TAU);
        console.log(`\n\n==============================\nCODUL TAU DE 8 CIFRE: ${code}\n==============================\n`);
        console.log(`Du-te in WhatsApp > Setari > Dispozitive conectate > Conecteaza cu numar de telefon`);
        console.log(`Baga codul: ${code}\n\n`);
      } catch(e){ console.log('Eroare pairing: '+e.message) }
    }, 3000);
  }

  sock.ev.on('messages.upsert', async ({messages}) => {
    let m = messages[0];
    if(!m.message) return;
    let txt = m.message.conversation || m.message.extendedTextMessage?.text || "";
    console.log('Mesaj primit: '+txt);
    if(!txt.startsWith(".")) return;
    let cmd = txt.slice(1).toLowerCase().split(" ")[0];

    if(cmd == 'menu' || cmd == 'meniu' || cmd == 'meni') {
      await sock.sendMessage(m.key.remoteJid, {
        text: `╭─〔 👑 *MORTEX ULTRA* 〕─\n│ Prefix:.\n│ Online: ✅\n╰───────────────\n\nComenzi:\n.menu - Meniu\n.ping - Verifica\n\n© Cosmin`
      });
      console.log('✅ MENIU TRIMIS');
    }
    if(cmd == 'ping') {
      await sock.sendMessage(m.key.remoteJid, { text: 'Pong! 🏓 Bot online Bro!' });
    }
  });

  sock.ev.on('connection.update', u => {
    if(u.connection=='open') console.log('✅ BOT ONLINE! Scrie.menu acum!');
    if(u.connection=='close') start();
  });
}
start();
