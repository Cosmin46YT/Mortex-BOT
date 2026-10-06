const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const express = require('express');

// Tine Koyeb-ul viu - altfel te inchide!
const app = express();
app.get('/', (req,res) => res.send('MORTEX BOT ONLINE ✅'));
app.listen(process.env.PORT || 8000, () => console.log('Server Web Pornit'));

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({
    auth: state,
    logger: P({level:'silent'}),
    printQRInTerminal: false,
    browser:["Ubuntu","Chrome","20.0.04"]
  });
  sock.ev.on('creds.update', saveCreds);

  const NUMAR = "40770811929";

  if(!sock.authState.creds.registered) {
    console.log('Generez cod...');
    const cereCod = async () => {
      try {
        let code = await sock.requestPairingCode(NUMAR);
        console.log(`\n\n==============================\n CODUL TAU: ${code}\n BAGA-L ACUM IN WHATSAPP!\n WhatsApp > Dispozitive conectate\n > Conecteaza cu numar\n==============================\n\n`);
      } catch(e){ console.log('Eroare, reincerc...'); }
    };
    setTimeout(cereCod, 5000);
    setInterval(cereCod, 25000); // la 25 sec iti da cod nou non-stop
  }

  sock.ev.on('messages.upsert', async ({messages}) => {
    let m = messages[0]; if(!m.message) return;
    let txt = m.message.conversation || m.message.extendedTextMessage?.text || "";
    console.log('Primit: '+txt);
    if(!txt.startsWith(".")) return;
    let cmd = txt.slice(1).toLowerCase().trim();
    if(cmd.startsWith('menu') || cmd.startsWith('meni')) {
      await sock.sendMessage(m.key.remoteJid, { text: "👑 *MORTEX ULTRA* 👑\n✅ BOT ONLINE NON-STOP!\n\n.menu - meniu\n.ping - test" });
    }
  });

  sock.ev.on('connection.update', u => {
    if(u.connection=='open') console.log('✅✅✅ CONECTAT! GATA BRO!');
    if(u.connection=='close') setTimeout(start, 3000);
  });
}
start();
