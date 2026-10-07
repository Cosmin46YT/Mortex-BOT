module.exports = async (sock, m, from) => {
    const menu = `
╭━━━〔 *MORTEX-BOT* 〕━━━┈⊷
┃❖ Prefix:.
┃❖ Owner: Cosmin46YT
┃❖ Versiune: 1.0
┃❖ Status: Online ✅
╰━━━━━━━━━━━━━━━┈⊷

╭━━━〔 *COMENZI* 〕━━━┈⊷
┃✦.menu /.help
┃✦.ping - status bot
┃✦.owner - contact owner
┃✦.sticker - din poza/video
┃✦.play <nume> - muzica yt
┃✦.tiktok <link>
╰━━━━━━━━━━━━━━━┈⊷

> Mortex-BOT by Cosmin
    `.trim()

    // il trimite index.js deja, asta e doar design extra daca vrei sa-l folosesti si in alte locuri
    return menu
}
