const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const P = require('pino');
const express = require('express');
const fs = require('fs');
const app = express();

const PHONE_NUMBER = process.env.PHONE_NUMBER || "40770811929";
let pairingCode = null;
let isOnline = false;
let sock;

if (process.env.SESSION_ID) {
    try {
        if (!fs.existsSync('./auth')) fs.mkdirSync('./auth');
        let session = process.env.SESSION_ID.replace('Mortex~', '').replace('
        let creds = Buffer.from(session, 'base64').toString('utf-8');
        fs.writeFileSync('./auth/creds.json', creds);
        console.log('✅ SESSION_ID incarcat!');
    } catch (e) {
        console.log('❌ SESSION_ID invalid: ' + e.message);
    }
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    if (!state.creds.registered) {
        setTimeout(async () => {
            try {
                let num = PHONE_NUMBER.replace(/[^0-9]/g, '');
                pairingCode = await sock.requestPairingCode(num);
                console.log("CODUL TAU: " + pairingCode);
            } catch (e) {
                console.log('Eroare cod: ', e);
            }
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (up) => {
        const { connection } = up;
        if (connection === 'open') {
            isOnline = true;
            console.log('Mortex BOT Conectat!');
            try {
                await delay(2000);
                let credsData = fs.readFileSync('./auth/creds.json');
                let sessionID = `Mortex~${Buffer.from(credsData).toString('base64')}`;
                let myJid = sock.user.id;
                await sock.sendMessage(myJid, {
                    text: `✅ *Mortex-BOT Conectat!*\n\n🔑 *SESSION_ID:*\n\n${sessionID}\n\n_Pune-l in Koyeb la SESSION_ID_`
                });
                console.log('✅ SESSION_ID trimis pe WhatsApp!');
            } catch (err) {
                console.log('Eroare trimitere: ' + err);
            }
        }
        if (connection === 'close') {
            isOnline = false;
            pairingCode = null;
            startBot();
        }
    });
}

startBot();

app.get('/', (req, res) => {
    res.send(`<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{background:black;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:Arial}button{width:220px;padding:18px;margin:10px;border-radius:12px;font-size:16px;font-weight:bold;border:1px solid white;cursor:pointer}.qr{background:black;color:white}.pair{background:white;color:black}#code{margin-top:20px;font-size:28px;letter-spacing:3px}</style></head><body><button class="qr" onclick="location.reload()">QR CODE</button><button class="pair" onclick="location.reload()">PAIR CODE</button><div id="code">${pairingCode ? `CODUL: ${pairingCode}` : isOnline ? 'BOT ONLINE ✅' : 'Se genereaza codul... refresh in 3 sec'}</div><a href="/session" style="margin-top:20px;color:cyan">GET SESSION_ID</a><p style="margin-top:30px;color:gray">Mortex-BOT by Cosmin46YT</p><script>setTimeout(()=>{if(!document.getElementById('code').innerText.includes('CODUL')) location.reload()},3000)</script></body></html>`);
});

app.get('/session', (req, res) => {
    try {
        if (fs.existsSync('./auth/creds.json')) {
            let creds = fs.readFileSync('./auth/creds.json');
            let base64 = Buffer.from(creds).toString('base64');
            let sessionID = `Mortex~${base64}`;
            res.send(`<body style="background:black;color:white;padding:20px;word-break:break-all"><h3>SESSION_ID:</h3><textarea style="width:95%;height:300px">${sessionID}</textarea></body>`);
        } else {
            res.send('Nu esti conectat inca!');
        }
    } catch (e) { res.send('Eroare: ' + e) }
});

app.listen(8000, () => console.log('Site pairing pe port 8000'));
