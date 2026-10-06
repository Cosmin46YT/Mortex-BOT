const yts = require('yt-search')
const ytdl = require('@distube/ytdl-core')
let handler = async (m, { conn, text }) => {
if (!text) return m.reply('Scrie:.play nume melodie\nEx:.play si-a tras papuci gucci')
let search = await yts(text)
let video = search.videos[0]
if (!video) return m.reply('Nu am gasit!')
let info = `*🎵 Se descarca:* ${video.title}\n*⏱️ Durata:* ${video.timestamp}\n*Asteapta...*`
await conn.sendMessage(m.chat, { text: info }, { quoted: m })
let audio = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' })
await conn.sendMessage(m.chat, { audio: { stream: audio }, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3` }, { quoted: m })
}
handler.command = ['play','song','muzica']
module.exports = handler
