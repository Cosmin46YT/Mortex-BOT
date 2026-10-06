let handler = async (m, { conn }) => {
let txt = `
╭───「 *MORTEX-BOT ULTRA* 」───
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
│ Botul trimite direct melodia audio!
└──────────────────────

> *Powered by Mortex-BOT | Craiova 🇷🇴*
`

// Trimite cu poza daca exista, fara poza daca nu
try {
await conn.sendMessage(m.chat, { image: { url: './media/menu.jpg' }, caption: txt }, { quoted: m })
} catch {
await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
}

}
handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu','help','comenzi','allmenu','200']
module.exports = handler
