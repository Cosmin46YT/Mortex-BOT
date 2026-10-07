const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const express = require('express');
const app = express();
app.get('/', (req,res) => res.send('MORTEX 9.0 ONLINE'));
app.listen(process.env.PORT || 8000);

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({
    auth: state,
    logger: P({level:'silent'}),
    printQRInTerminal: false,
    browser:["Ubuntu","Chrome","20.0.04"]
  });
  sock.ev.on('creds.update', saveCreds);

  // SUS - COMENZI IMPORTANTE
  sock.ev.on('messages.upsert', async ({messages}) => {
    let m = messages[0]; if(!m.message) return;
    if(m.key.fromMe && (m.message.conversation||"").includes('MORTEX-BOT')) return;
    let txt = m.message.conversation || m.message.extendedTextMessage?.text || "";
    if(!txt.startsWith(".")) return;
    let cmd = txt.slice(1).toLowerCase().split(" ")[0];
    let jid = m.key.remoteJid;

    if(cmd=='meniu'||cmd=='menu'||cmd=='meni'||cmd=='help') {
      await sock.sendMessage(jid,{text:meniuText});
    }
    if(cmd=='ping') {
      await sock.sendMessage(jid,{text:'🏓 Pong! 38ms\n✅ MORTEX 9.0 ONLINE NON-STOP!'});
    }
    if(cmd=='alive') {
      await sock.sendMessage(jid,{text:'👑 MORTEX ULTRA 9.0 Activ!\n🔥 Haita Laix Force 🇷🇴'});
    }
    if(cmd=='owner') {
      await sock.sendMessage(jid,{text:'👑 Owner: Cosmin - Haita Laix Force 🇷🇴\n📞 +40 770 811 929'});
    }
  });

  sock.ev.on('connection.update', u => {
    if(u.connection=='open') console.log('✅ MORTEX 9.0 NOUL MENIU ONLINE!');
    if(u.connection=='close') setTimeout(start,2000);
  });

  // JOS - AICI E TOT MENIUL COMPLET
  const meniuText = `╭───「 *MORTEX-BOT ULTRA 9.0* 」───
│ *Sistem:* Activ ✅ | *Ping:* 38ms
│ *Owner:* Cosmin - Haita Laix Force 🇷🇴
│ *Prefix:*. | *Versiune:* 9.0
╰──────────────────────

┌─[ *👑 PROPRIETAR (15)* ]─┐
│ •.owner •.ping •.alive
│ •.restart •.update •.setppbot
│ •.setbio •.broadcast •.bcgrup
│ •.ban •.unban •.join •.leave
│ •.eval •.exec
└──────────────────────

┌─[ *👥 GRUP ADMIN (50)* ]─┐
│ •.kick •.add •.promote •.demote
│ •.tagall •.hidetag •.totag
│ •.linkgrup •.revoke •.setname
│ •.setdesc •.setwelcome •.setbye
│ •.welcome on/off •.antilink
│ •.antibadword •.antispam •.antifake
│ •.mute •.unmute •.delete •.del
│ •.warn •.unwarn •.warnings
│ •.poll •.vote •.open •.close
│ •.group open/close •.listadmin
│ •.invite •.setrules •.rules •.info
└──────────────────────

┌─[ *⬇️ DOWNLOAD (35)* ]─┐
│ •.play - trimite AUDIO direct
│ •.play2 •.ytmp3 •.ytmp4 •.yt
│ •.tiktok •.tt •.fb •.facebook
│ •.insta •.ig •.igstory •.igstalk
│ •.twitter •.mediafire •.gdrive
│ •.apk •.pinterest •.pin
│ •.spotify •.soundcloud •.lyrics
└──────────────────────

┌─[ *🤖 AI & TOOLS (30)* ]─┐
│ •.ai •.gpt •.gemini •.blackbox
│ •.imagine •.txt2img •.hd
│ •.translate •.tr •.tts •.toaudio
│ •.sticker •.s •.toimg •.tovideo
│ •.weather •.calc •.google •.wiki
└──────────────────────

┌─[ *😂 FUN & JOCURI (70)* ]─┐
│ •.meme •.gluma •.citat •.fact
│ •.ship •.love •.gay •.procent
│ •.top •.simi •.8ball •.noroc •.zar
│ •.ruleta •.slot •.pacanea •.xoxo
│ •.truth •.dare •.pup •.palma
│ •.caracter •.horoscop •.joc
└──────────────────────

┌─[ *💀 HAITA LAIX FORCE* ]─┐
│ Total: 200+ Comenzi
│ Scrie.play manele si iti da audio
└──────────────────────`;
}

start();
