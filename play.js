const yts = require("yt-search")

module.exports = async (sock, m, from, query) => {
    if (!query) {
        await sock.sendMessage(from, { text: "❌ Scrie.play manele 2024" })
        return
    }
    try {
        await sock.sendMessage(from, { text: `🔎 Caut *${query}*...` })
        const search = await yts(query)
        const video = search.videos[0]
        if (!video) {
            await sock.sendMessage(from, { text: "Nu am gasit nimic." })
            return
        }
        const text = `*🎵 ${video.title}*\n\n⏱️ Durata: ${video.timestamp}\n👁️ Vizualizari: ${video.views}\n📅 Publicat: ${video.ago}\n🔗 ${video.url}\n\n> Ca sa descarci audio ai nevoie de modulul @mortex/ytdl in plus. Momentan iti dau link-ul.`
        await sock.sendMessage(from, {
            image: { url: video.thumbnail },
            caption: text
        })
    } catch (e) {
        console.log(e)
        await sock.sendMessage(from, { text: "Eroare la.play: " + e.message })
    }
}
