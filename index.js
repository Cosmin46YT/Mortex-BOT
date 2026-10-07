const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, delay } = require("@whiskeysockets/baileys")
const P = require("pino")
const fs = require("fs")
const path = require("path")
const { Boom } = require("@hapi/boom")

// importa modulele tale daca exista
let menuHandler, playHandler
try { menuHandler = require("./menu") } catch {}
try { playHandler = require("./play") } catch {}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session")

    const sock = makeWASocket({
        logger: P({ level: "silent" }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: "silent" }))
        },
        browser: ["Mortex-BOT", "Chrome", "1.0.0"]
    })

    // pairing code logic - e in pair.js la tine, dar il legam aici
    if (!sock.authState.creds.registered) {
        console.log("Botul nu e conectat. Ruleaza pair.js pentru pairing code sau scaneaza QR.")
        // daca ai pair.js care cere numar, il poti rula separat: node pair.js
    }

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom? lastDisconnect.error.output.statusCode : 0)!== DisconnectReason.loggedOut
            console.log("Conexiune inchisa:", lastDisconnect?.error)
            if (shouldReconnect) {
                console.log("Reconectare...")
                startBot()
            } else {
                console.log("Logged out, sterge folderul session si reconecteaza-te")
            }
        } else if (connection === "open") {
            console.log("✅ Mortex-BOT conectat cu succes!")
        }
    })

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0]
        if (!m.message) return
        if (m.key.fromMe) return

        const from = m.key.remoteJid
        const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || ""
        const args = body.trim().split(/ +/)
        const command = args.shift()?.toLowerCase()

        console.log(`[MESAJ] ${from}: ${body}`)

        // COMENZI DE BAZA
        if (command === ".menu" || command === ".help") {
            const menuText = `
╭─── *MORTEX-BOT* ───
│ Prefix:.
│ Owner: Cosmin
│ Status: Online ✅
╰───────────────

*Comenzi:*
.menu /.help - arata meniul
.ping - verifica botul
.sticker - face sticker din imagine
.play <nume> - descarca melodie
            `
            await sock.sendMessage(from, { text: menuText })
            // daca ai logica in menu.js
            if (typeof menuHandler === "function") menuHandler(sock, m, from)
        }

        if (command === ".ping") {
            await sock.sendMessage(from, { text: "Pong! 🏓 Mortex-BOT e online - " + new Date().toLocaleString("ro-RO") })
        }

        if (command === ".sticker" || command === ".s") {
            if (m.message.imageMessage || m.message.videoMessage) {
                const buffer = await sock.downloadMediaMessage(m)
                await sock.sendMessage(from, { sticker: buffer })
            } else {
                await sock.sendMessage(from, { text: "Trimite o imagine cu caption.sticker" })
            }
        }

        if (command === ".play") {
            if (typeof playHandler === "function") {
                playHandler(sock, m, from, args.join(" "))
            } else {
                await sock.sendMessage(from, { text: "Modulul play.js nu e configurat inca. Adauga logica de yt download." })
            }
        }
    })
}

startBot()
