const express = require('express');
const app = express();
const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(`
  <html style="background:black;color:white;text-align:center;padding-top:100px;font-family:Arial">
  <body>
    <button onclick="location.href='/qr'" style="padding:15px 30px;border:1px solid white;background:black;color:white;border-radius:10px;margin:10px">QR CODE</button><br>
    <button onclick="pair()" style="padding:15px 30px;background:white;color:black;border-radius:10px;margin:10px">PAIR CODE</button>
    <div id="code" style="margin-top:20px;font-size:24px"></div>
    <script>
      async function pair(){
        let num = prompt("Baga numarul cu prefix 40, ex: 40712345678");
        if(!num) return;
        let res = await fetch('/pair?number='+num);
        let data = await res.json();
        document.getElementById('code').innerText = "CODUL TAU: " + data.code;
      }
    </script>
  </body>
  </html>`);
});

app.get('/pair', async (req, res) => {
  let num = req.query.number;
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({ auth: state, logger: pino({level:'silent'}), printQRInTerminal:false });
  sock.ev.on('creds.update', saveCreds);
  if(!state.creds.registered){
    await delay(2000);
    let code = await sock.requestPairingCode(num);
    res.json({code: code});
  }
});

app.listen(3000, () => console.log('Pair running on 3000'));
