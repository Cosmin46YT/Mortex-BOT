const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({
    auth: state,
    logger: P({level:'silent'}),
    printQRInTerminal: false,
    browser:["Ubuntu","Chrome","20.0.04"]
  });

  sock.ev.on('creds.update', saveCreds);

  // CODUL DE PAIRING - ASTA ITI TREBUIE PENTRU TELEFON!
  if (!sock.authState.creds.registered) {
    console.log('--- CONECTARE WHATSAPP ---');
    let phoneNumber = process.env.PHONE_NUMBER;
    if (!phoneNumber) {
      phoneNumber = await question('📱 Scrie numarul tau cu prefix (ex: 40770811929): ');
    }
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');
    console.log(`Se genereaza codul pentru +${phoneNumber}...`);
    await new Promise(r => setTimeout(r, 2000));
    let code = await sock.requestPairingCode(phoneNumber);
    console.log(`\n🔑 CODUL TAU DE CONECTARE: ${code}\n`);
    console.log('1. Deschide WhatsApp pe telefon');
    console.log('2. Setari > Dispozitive conectate > Conecteaza dispozitiv');
    console.log('3. Alege "Conecteaza cu numar de telefon" si scrie codul de mai sus!');
    rl.close();
  }
const meniuText = `╭───「 *MORTEX-BOT ULTRA 9.0* 」───
│ *Sistem:* Activ ✅ | *Ping:* 38ms
│ *Owner:* Cosmin - Haita Laix Force 🇷🇴
│ *Prefix:*. | *Versiune:* 9.0
╰──────────────────────

┌─[ *👑 PROPRIETAR* ]─┐
│ •.owner •.ping •.alive •.restart
│ •.update •.broadcast •.ban •.eval
└──────────────────────

┌─[ *👥 GRUP ADMIN (50)* ]─┐
│ •.kick •.add •.promote •.demote
│ •.tagall •.hidetag •.linkgrup
│ •.setwelcome •.antilink •.mute
│ •.warn •.group open/close
└──────────────────────

┌─[ *⬇️ DOWNLOAD (35)* ]─┐
│ •.play •.ytmp3 •.ytmp4 •.tiktok
│ •.fb •.insta •.mediafire •.apk
│ •.pinterest •.spotify
└──────────────────────

┌─[ *🤖 AI & TOOLS (30)* ]─┐
│ •.ai •.gpt •.imagine •.sticker
│ •.translate •.tts •.toimg
└──────────────────────

┌─[ *😂 FUN (70)* ]─┐
│ •.meme •.ship •.8ball •.slot •.pup
└──────────────────────

┌─[ *💀 HAITA LAIX FORCE* ]─┐
│ Total: 200+ Comenzi |.play manele
└──────────────────────`;

  sock.ev.on('messages.upsert', async ({messages}) => {
    let m = messages[0]; if(!m.message) return;
    let txt = m.message.conversation || m.message.extendedTextMessage?.text || "";
    if(!txt.startsWith(".")) return;
    let cmd = txt.slice(1).toLowerCase().split(" ")[0];
    let jid = m.key.remoteJid;
    if(['meniu','menu','meni','help'].includes(cmd)) await sock.sendMessage(jid,{text:meniuText});
    

  sock.ev.on('connection.update', u => {
    if(u.connection=='open') console.log('✅ MORTEX 9.0 ONLINE CU PAIRING + MENIU NOU!');
    if(u.connection=='close') setTimeout(start,2000);
  });
}
start();
