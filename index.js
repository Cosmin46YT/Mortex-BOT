const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

const meniuText = `╭───「 *MORTEX-BOT ULTRA 9.0* 」───
│ *Sistem:* Activ ✅ | *Ping:* 38ms
│ *Owner:* Cosmin - Haita Laix Force 🇷🇴
│ *Prefix:*. | *Versiune:* 9.0 FINALA
╰──────────────────────

┌─[ *👑 PROPRIETAR* ]─┐
│ •.owner •.ping •.alive •.restart
│ •.update •.broadcast •.ban
└──────────────────────

┌─[ *👥 GRUP ADMIN* ]─┐
│ •.kick •.add •.promote •.demote
│ •.tagall •.hidetag •.linkgrup
│ •.setwelcome •.antilink •.mute
│ •.warn •.group open/close
└──────────────────────

┌─[ *⬇️ DOWNLOAD* ]─┐
│ •.play •.ytmp3 •.ytmp4 •.tiktok
│ •.fb •.insta •.mediafire •.apk
└──────────────────────

┌─[ *🤖 AI & TOOLS* ]─┐
│ •.ai •.gpt •.imagine •.sticker
│ •.translate •.tts •.toimg
└──────────────────────

┌─[ *😂 FUN* ]─┐
│ •.meme •.ship •.8ball •.slot •.pup
└──────────────────────

┌─[ *💀 HAITA LAIX FORCE* ]─┐
│ Total: 200+ Comenzi
└──────────────────────`;

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({
    auth: state,
    logger: P({level:'silent'}),
    printQRInTerminal: false,
    browser:["Ubuntu","Chrome","20.0.04"]
  });
  sock.ev.on('creds.update', saveCreds);

  if (!sock.authState.creds.registered) {
    let phoneNumber = process.env.PHONE_NUMBER;
    if (!phoneNumber) phoneNumber = await question('📱 Numar cu prefix: ');
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    setTimeout(async () => {
      try {
        let code = await sock.requestPairingCode(phoneNumber);
        console.log(`\n🔑 CODUL TAU: ${code}\n`);
      } catch(e){ console.log(e.message) }
    }, 3000);
  }

  sock.ev.on('messages.upsert', async ({messages}) => {
    let m = messages[0];
    if(!m.message) return;
    let txt = m.message.conversation || m.message.extendedTextMessage?.text || "";
    if(!txt.startsWith(".")) return;
    let cmd = txt.slice(1).toLowerCase().split(" ")[0];
    let jid = m.key.remoteJid;
    if(['meniu','menu','meni','help'].includes(cmd)) await sock.sendMessage(jid,{text:meniuText});
    if(cmd=='ping') await sock.sendMessage(jid,{text:'🏓 Pong! 38ms ✅ MORTEX 9.0'});
    if(cmd=='owner') await sock.sendMessage(jid,{text:'👑 Cosmin - Haita Laix Force'});
  });

  sock.ev.on('connection.update', u => {
    if(u.connection=='open') console.log('✅ MORTEX 9.0 ONLINE!');
    if(u.connection=='close') setTimeout(start,2000);
  });
}
start();
