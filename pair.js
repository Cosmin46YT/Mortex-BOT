const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys")
const P = require("pino")
const readline = require("readline")

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (text) => new Promise((resolve) => rl.question(text, resolve))

async function pairing() {
    const { state, saveCreds } = await useMultiFileAuthState("session")
    const sock = makeWASocket({
        logger: P({ level: "silent" }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: "silent" }))
        },
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    })

    sock.ev.on("creds.update", saveCreds)

    if (!sock.authState.creds.registered) {
        console.log("\n=== MORTEX-BOT PAIRING ===\n")
        const phoneNumber = await question("40770811929")
        const code = await sock.requestPairingCode(phoneNumber.trim())
        console.log(`\n🔑 Codul tau de pairing este: ${code}\n`)
        console.log("Du-te in WhatsApp > Setari > Dispozitive conectate > Conecteaza un dispozitiv > Conecteaza cu numar de telefon")
        console.log("Si introdu codul de mai sus!\n")
    } else {
        console.log("Deja conectat! Sterge folderul session daca vrei alt cod.")
    }
    rl.close()
}

pairing()
