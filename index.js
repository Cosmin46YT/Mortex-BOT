const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const express = require('express');
const app = express();

const PHONE_NUMBER = process.env.PHONE_NUMBER || "+40770811929";
let pairingCode = null;
let isOnline = false;
let sock;

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');

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
        const { connection, lastDisconnect } = up;
        if (connection === 'open') {
            isOnline = true;
            console.log('Mortex BOT Conectat!');
        }
        if (connection === 'close') {
            isOnline = false;
            pairingCode = null;
            startBot();
        }
    });
}

startBot();

// PAGINA WEB CA IN POZA TA - QR CODE / PAIR CODE
app.get('/', (req, res) => {
    res.send(`
    <html>
    <head><meta name="viewport" content="width=device-width, initial-scale=1"><style>
    body{background:black;color:white;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:Arial}
    button{width:220px;padding:18px;margin:10px;border-radius:12px;font-size:16px;font-weight:bold;border:1px solid white;cursor:pointer}
    .qr{background:black;color:white} .pair{background:white;color:black}
    #code{margin-top:20px;font-size:28px;letter-spacing:3px}
    </style></head>
    <body>
    <button class="qr" onclick="location.reload()">QR CODE</button>
    <button class="pair" onclick="location.reload()">PAIR CODE</button>
    <div id="code">${pairingCode ? `CODUL: ${pairingCode}` : isOnline ? 'BOT ONLINE ✅' : 'Se genereaza codul... refresh in 3 sec'}</div>
    <p style="margin-top:30px;color:gray">Mortex-BOT by Cosmin46YT</p>
    <script>setTimeout(()=>{if(!document.getElementById('code').innerText.includes('CODUL')) location.reload()},3000)</script>
    </body></html>
    `);
});

app.listen(8000, () => console.log('Site pairing pe port 8000'));
