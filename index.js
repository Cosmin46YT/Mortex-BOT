const express = require('express');
const app = express();
let qrCode = null;
let status = "Porneste botul...";

async function startBot(){
  const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
  const pino = require('pino');
  const { state, saveCreds } = await useMultiFileAuthState('./auth');

  const sock = makeWASocket({
    auth: state,
    logger: pino({level:'silent'}),
    browser: ["Mortex-BOT","Chrome","1.0"]
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (u)=>{
    if(u.qr){ qrCode = u.qr; status = "Scaneaza QR-ul mai jos!"; }
    if(u.connection === 'open'){ status = "✅ BOT ONLINE!"; qrCode = null; console.log("MORTEX ONLINE");}
    if(u.connection === 'close'){
       const reason = u.lastDisconnect?.error?.output?.statusCode;
       if(reason!== DisconnectReason.loggedOut) setTimeout(startBot, 3000);
    }
  });

  sock.ev.on('messages.upsert', async ({messages})=>{
    const m = messages[0];
    if(!m.message) return;
    const text = m.message.conversation || m.message.extendedTextMessage?.text || "";
    if(text.trim() === ".ping"){
      await sock.sendMessage(m.key.remoteJid, {text:"⚡ Mortex e ONLINE vere!"}, {quoted:m});
    }
  });
}

app.get('/', async (req,res)=>{
  if(qrCode){
    const QR = require('qrcode');
    const img = await QR.toDataURL(qrCode);
    return res.send(`<body style="background:#000;color:#fff;text-align:center;font-family:Arial"><h1>👑 MORTEX BOT</h1><h2>${status}</h2><img src="${img}" style="border:10px solid white" width="300"><p>Deschide WhatsApp > Setari > Dispozitive conectate > Conecteaza dispozitiv</p></body>`);
  }
  res.send(`<body style="background:#000;color:#fff;text-align:center;padding:100px 20px;font-family:Arial"><h1>${status}</h1><p>Asteapta QR-ul...</p></body>`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{ startBot(); });
