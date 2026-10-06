const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');

// === SESSION_ID PUS DIRECT ===
const MY_SESSION = "Mortex~PUNE_CODUL_TAU_AICI_COMPLET";

if (MY_SESSION.includes("Mortex~")) {
    try {
        if (!fs.existsSync('./auth')) fs.mkdirSync('./auth');
        let session = MY_SESSION.replace('Mortex~','').replace('MORTEX~','');
        let creds = Buffer.from(session, 'base64').toString('utf-8');
        fs.writeFileSync('./auth/creds.json', creds);
        console.log('✅ SESSION_ID incarcat!');
    } catch(e){ console.log('❌ SESSION_ID invalid: '+e.message) }
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    const sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        browser: ["Ubuntu","Chrome","20.0.04"]
    });

    sock.ev.on('creds.update', saveCreds);

    // === INCARCA PLUGINURI ===
    sock.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const m = messages[0];
            if (!m.message) return;
            const text = m.message.conversation || m.message.extendedTextMessage?.text || "";
            if (!text.startsWith(".")) return;

            const args = text.slice(1).trim().split(/ +/);
            const command = args.shift().toLowerCase();

            // cauta prin plugins
            const pluginsFolder = path.join(__dirname, 'plugins');
            if (!fs.existsSync(pluginsFolder)) return;
            const files = fs.readdirSync(pluginsFolder);

            for (const file of files) {
                if (!file.endsWith('.js')) continue;
                const plugin = require(path.join(pluginsFolder, file));
                if (plugin.command && plugin.command.includes(command)) {
                    await plugin(m, { conn: sock, args, text });
                }
            }
        } catch(e){ console.log('Eroare plugin: '+e) }
    });

    sock.ev.on('connection.update', (up) => {
        if (up.connection === 'open') console.log('Mortex BOT Conectat cu plugins!');
        if (up.connection === 'close') startBot();
    });
}

startBot();
