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
        let session = process.env.SESSION_ID.replace('Mortex~', '').replace('MORTEX~', 'Mortex~eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiK01KMkI1WXcrSlVJM3ZDRUZHQzZEcFI2R2RPelhZQXJ2T0pnekl1a2gzQT0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiNndqOFM1OGVkcjcwVFZ3R3ZvaGVFU0Z2c0d3RVpjL0FTN3JtTUhIU0pSbz0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJTTTZ0Z1BBbWR2bTAzaEYwbWJWeXhKcG9LYmQ4dXd4MGZRajhCV1daUVgwPSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJsU1pmK2ViTy9hSWVRQjV1eUxTQWlWelFFMnR4anJFVkQxNnpGaWFrTW5nPSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IjBBQWVhNldwbXFUd0haNjBmM2tUQlNrdVd5eFpsR0FCY3dBdkFDODNhbVE9In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6ImY5cGZmR2dUWjc1OTZiM3lxdGp5QURydmY3Zk5iOU53U0VaY2x3cDJad0E9In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiS05NcEZhYUp3OUw2WVkwSGJqdUxGNXVSVjhmZWxUR1BXdG5uQTRxd1hVMD0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoialBTVXVnNGpwQmNGdHdmZndUb1h4enZZajh3K200QTZRQkM1K2RreHRXbz0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IjJhdDF5MnRHbStrTWlWcFVEMUtJR2VVQnp1QUNLQXJ4VmlzalFZN3JjcTNvcGRKZW9XUEl3Y3IxcmZkS0tSeUZVa3NrLy83YXkyTFJ3YXVyaUpnd2h3PT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6MTk0LCJhZHZTZWNyZXRLZXkiOiJjUmhUNFRXeUVFK3VwQ2xFWHIyQ2QyS2laV244UzBtOGdMb0RSUWF4a0RJPSIsInByb2Nlc3NlZEhpc3RvcnlNZXNzYWdlcyI6W10sIm5leHRQcmVLZXlJZCI6MzEsImZpcnN0VW51cGxvYWRlZFByZUtleUlkIjozMSwiYWNjb3VudFN5bmNDb3VudGVyIjowLCJhY2NvdW50U2V0dGluZ3MiOnsidW5hcmNoaXZlQ2hhdHMiOmZhbHNlfSwicmVnaXN0ZXJlZCI6dHJ1ZSwicGFpcmluZ0NvZGUiOiI2N0hUQkY2OCIsIm1lIjp7ImlkIjoiNDA3NzA4MTE5Mjk6MTRAcy53aGF0c2FwcC5uZXQiLCJsaWQiOiIxMTE3NDI5MTkxNzYzNDY6MTRAbGlkIiwibmFtZSI6IkNvc21pbiDvo78ifSwiYWNjb3VudCI6eyJkZXRhaWxzIjoiQ0lUeXp2NE5FTGFsbGRZR0dBRWdBQ2dBIiwiYWNjb3VudFNpZ25hdHVyZUtleSI6Inl2MkJkNW1NQ1pBaE1Wd1RzS016WHRKcFcwRTlTWlJ3QTg4aE1ybGtNbVk9IiwiYWNjb3VudFNpZ25hdHVyZSI6IklaLytjVjVtTUJnc1JOb1V6aEhwYnJYUWRSTzFhZm1Cb2h4c3dwZ1lCZFdmSStnM0J4cElCbVZscURqUDBzZWJMNjJoZ2dwSno4VSt2amYvdmNYc2dRPT0iLCJkZXZpY2VTaWduYXR1cmUiOiJtUkNtSm9OMzRwVGFSVmFucWE1R2x2Ni91STlKc05ibldQcXpaZW5aVS9HNDBFWDF0Yk1UYlZpWjZ6cDNKb05rVS95dlZFU2NKaEFGM2pTVnREcjFpQT09In0sInNpZ25hbElkZW50aXRpZXMiOlt7ImlkZW50aWZpZXIiOnsibmFtZSI6IjQwNzcwODExOTI5OjE0QHMud2hhdHNhcHAubmV0IiwiZGV2aWNlSWQiOjB9LCJpZGVudGlmaWVyS2V5Ijp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQmNyOWdYZVpqQW1RSVRGY0U3Q2pNMTdTYVZ0QlBVbVVjQVBQSVRLNVpESm0ifX1dLCJwbGF0Zm9ybSI6ImlwaG9uZSIsInJvdXRpbmdJbmZvIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQ0FnSUFnZ1MifSwibGFzdEFjY291bnRTeW5jVGltZXN0YW1wIjoxNzkxMzE2NjY5LCJteUFwcFN0YXRlS2V5SWQiOiJBQUFBQURKSyJ9
');
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
