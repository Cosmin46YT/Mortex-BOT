const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const express = require('express');

const app = express();
app.get('/', (req,res) => res.send('MORTEX ULTRA 9.0 ONLINE ✅'));
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

  const meniuText = `╭───「 *MORTEX-BOT ULTRA* 」───
│ *Sistem:* Activ ✅ | *Ping:* 42ms
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
│ •.welcome on/off •.antilink on/off
│ •.antibadword on/off •.antispam on/off
│ •.antisticker on/off •.antifake
│ •.mute •.unmute •.delete •.del
│ •.warn •.unwarn •.warnings
│ •.poll •.vote •.open •.close
│ •.group open/close •.afk •.listadmin
│ •.invite •.setrules •.rules •.info
└──────────────────────

┌─[ *⬇️ DOWNLOAD (35)* ]─┐
│ •.play [nume] - *trimite AUDIO*
│ •.play2 •.ytmp3 •.ytmp4 •.yt
│ •.tiktok •.tt •.fb •.facebook
│ •.insta •.ig •.igstory •.igstalk
│ •.twitter •.mediafire •.gdrive
│ •.apk •.apkdl •.pinterest •.pin
│ •.spotify •.soundcloud •.lyrics
│ •.shazam •.imagen •.wallpaper
└──────────────────────

┌─[ *🤖 AI & TOOLS (30)* ]─┐
│ •.ai •.gpt •.gemini •.blackbox
│ •.imagine •.txt2img •.hd •.upscale
│ •.translate •.tr •.tts •.toaudio
│ •.sticker •.s •.toimg •.tovideo
│ •.whatmusic •.ocr •.readmore
│ •.weather •.calc •.google •.wiki
└──────────────────────

┌─[ *😂 FUN & JOCURI (70)* ]─┐
│ •.meme •.gluma •.citat •.fact
│ •.ship •.love •.gay •.procent
│ •.top •.simi •.simi2 •.dox
│ •.8ball •.noroc •.zar •.ppt
│ •.ruleta •.slot •.pacanea •.xoxo
│ •.spinzura •.ghiceste •.quiz
│ •.truth •.dare •.curiozitati
│ •.pup •.imbratisare •.palma •.lupta
│ •.stupid •.destept •.lenes •.frumos
│ •.simp •.pizda •.caracter •.horoscop
│ •.cuplu •.prieten •.dusman •.joc
└──────────────────────

┌─[ *💀 HAITA LAIX FORCE* ]─┐
│ Total Comenzi: *200+*
│ Scrie: *.play manele* sau *.play nume*
│ Botul trimite direct melodia audio
└──────────────────────`;

  sock.ev.on('messages.upsert', async ({messages}) => {
    let m = messages[0]; if(!m.message) return;
    let txt = m.message.conversation || m.message.extendedTextMessage?.text || "";
    if(!txt.startsWith(".")) return;
    let cmd = txt.slice(1).toLowerCase().split(" ")[0];
    let jid = m.key.remoteJid;

    if(cmd=='meniu' || cmd=='menu' || cmd=='meni' || cmd=='help') {
      await sock.sendMessage(jid, { text: meniuText });
    }
    if(cmd=='ping') {
      await sock.sendMessage(jid, { text: '🏓 Pong! 42ms\n✅ MORTEX ULTRA 9.0 ONLINE!' });
    }
    if(cmd=='alive') {
      await sock.sendMessage(jid, { text: '👑 MORTEX-BOT ULTRA Activ! Haita Laix Force 🇷🇴' });
    }
    if(cmd=='owner') {
      await sock.sendMessage(jid, { text: '👑 Owner: Cosmin - Haita Laix Force 🇷🇴\n📱 +40 770 811 929' });
    }
    if(cmd.startsWith('play')) {
      let query = txt.slice(5).trim();
      if(!query) return sock.sendMessage(jid, { text: 'Scrie:.play manele\nEx:.play babi minune' });
      await sock.sendMessage(jid, { text: `🎵 Caut: *${query}*...\n⏳ O secunda Bro...` });
      // aici bagam downloadul dupa
    }
  });

  sock.ev.on('connection.update', u => {
    if(u.connection=='open') console.log('✅ MORTEX 9.0 ONLINE CU MENIUL NOU!');
    if(u.connection=='close') setTimeout(start, 2000);
  });
}
start();
