const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const express = require('express');
const app = express();

const PHONE_NUMBER = "+40770811929"; // Numarul tau
let pairingCode = null;
let isOnline = false;
let sock;

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ["Mortex Bot", "Chrome", "1.0.0"]
    });

    // Daca nu e conectat, cere COD
    if (!state.creds.registered) {
        setTimeout(async () => {
            try {
                pairingCode = await sock.requestPairingCode(PHONE_NUMBER);
                console.log("CODUL TAU: " + pairingCode);
            } catch (e) {
                console.log("Eroare cod: ", e);
            }
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            isOnline = true;
            pairingCode = null;
            console.log('✅ MORTEX ONLINE!');
        }
        if (connection === 'close') {
            isOnline = false;
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode!== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        }
    });

    // Comenzi bot
    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const from = msg.key.remoteJid;

        if (text.toLowerCase() === ".ping") {
            await sock.sendMessage(from, { text: "🏓 Pong! MORTEX ONLINE vere!" });
        }
        if (text.toLowerCase() === ".mortex") {
            await sock.sendMessage(from, { text: "👑 Eu sunt MORTEX, botul tau personal!" });
        }
    });
}

startBot();

app.get('/', (req, res) => {
    if (isOnline) {
        res.send("<h1 style='background:black;color:#00ff00;padding:50px;text-align:center;font-family:Arial'>✅ MORTEX ONLINE!<br><br>Scrie.ping pe WhatsApp</h1>");
    } else if (pairingCode) {
        res.send(`<div style='background:black;color:white;padding:50px;text-align:center;font-family:Arial'><h1>👑 MORTEX BOT</h1><h2>CODUL TAU ESTE:</h2><h1 style='font-size:50px;letter-spacing:10px;color:#00ff00;background:#111;padding:20px;border:2px dashed #00ff00'>${pairingCode}</h1><p>Intra in WhatsApp > Dispozitive conectate > Conecteaza cu numar de telefon > baga codul</p><p style='color:yellow'>Codul se schimba la refresh, baga-l repede!</p></div>`);
    } else {
        res.send("<h1 style='background:black;color:white;padding:50px;text-align:center'>⏳ Se genereaza codul... da refresh in 5 secunde</h1>");
    }
});

app.listen(3000, () => console.log("Server pornit pe 3000"));
