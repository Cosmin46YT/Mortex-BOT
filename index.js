const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');

const MY_SESSION = "Mortex~eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiK01KMkI1WXcrSlVJM3ZDRUZHQzZEcFI2R2RPelhZQXJ2T0pnekl1a2gzQT0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiNndqOFM1OGVkcjcwVFZ3R3ZvaGVFU0Z2c0d3RVpjL0FTN3JtTUhIU0pSbz0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJTTTZ0Z1BBbWR2bTAzaEYwbWJWeXhKcG9LYmQ4dXd4MGZRajhCV1daUVgwPSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJsU1pmK2ViTy9hSWVRQjV1eUxTQWlWelFFMnR4anJFVkQxNnpGaWFrTW5nPSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IjBBQWVhNldwbXFUd0haNjBmM2tUQlNrdVd5eFpsR0FCY3dBdkFDODNhbVE9In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6ImY5cGZmR2dUWjc1OTZiM3lxdGp5QURydmY3Zk5iOU53U0VaY2x3cDJad0E9In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiS05NcEZhYUp3OUw2WVkwSGJqdUxGNXVSVjhmZWxUR1BXdG5uQTRxd1hVMD0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoialBTVXVnNGpwQmNGdHdmZndUb1h4enZZajh3K200QTZRQkM1K2RreHRXbz0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IjJhdDF5MnRHbStrTWlWcFVEMUtJR2VVQnp1QUNLQXJ4VmlzalFZN3JjcTNvcGRKZW9XUEl3Y3IxcmZkS0tSeUZVa3NrLy83YXkyTFJ3YXVyaUpnd2h3PT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6MTk0LCJhZHZTZWNyZXRLZXkiOiJjUmhUNFRXeUVFK3VwQ2xFWHIyQ2QyS2laV244UzBtOGdMb0RSUWF4a0RJPSIsInByb2Nlc3NlZEhpc3RvcnlNZXNzYWdlcyI6W10sIm5leHRQcmVLZXlJZCI6MzEsImZpcnN0VW51cGxvYWRlZFByZUtleUlkIjozMSwiYWNjb3VudFN5bmNDb3VudGVyIjowLCJhY2NvdW50U2V0dGluZ3MiOnsidW5hcmNoaXZlQ2hhdHMiOmZhbHNlfSwicmVnaXN0ZXJlZCI6dHJ1ZSwicGFpcmluZ0NvZGUiOiI2N0hUQkY2OCIsIm1lIjp7ImlkIjoiNDA3NzA4MTE5Mjk6MTRAcy53aGF0c2FwcC5uZXQiLCJsaWQiOiIxMTE3NDI5MTkxNzYzNDY6MTRAbGlkIiwibmFtZSI6IkNvc21pbiDvo78ifSwiYWNjb3VudCI6eyJkZXRhaWxzIjoiQ0lUeXp2NE5FTGFsbGRZR0dBRWdBQ2dBIiwiYWNjb3VudFNpZ25hdHVyZUtleSI6Inl2MkJkNW1NQ1pBaE1Wd1RzS016WHRKcFcwRTlTWlJ3QTg4aE1ybGtNbVk9IiwiYWNjb3VudFNpZ25hdHVyZSI6IklaLytjVjVtTUJnc1JOb1V6aEhwYnJYUWRSTzFhZm1Cb2h4c3dwZ1lCZFdmSStnM0J4cElCbVZscURqUDBzZWJMNjJoZ2dwSno4VSt2amYvdmNYc2dRPT0iLCJkZXZpY2VTaWduYXR1cmUiOiJtUkNtSm9OMzRwVGFSVmFucWE1R2x2Ni91STlKc05ibldQcXpaZW5aVS9HNDBFWDF0Yk1UYlZpWjZ6cDNKb05rVS95dlZFU2NKaEFGM2pTVnREcjFpQT09In0sInNpZ25hbElkZW50aXRpZXMiOlt7ImlkZW50aWZpZXIiOnsibmFtZSI6IjQwNzcwODExOTI5OjE0QHMud2hhdHNhcHAubmV0IiwiZGV2aWNlSWQiOjB9LCJpZGVudGlmaWVyS2V5Ijp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQmNyOWdYZVpqQW1RSVRGY0U3Q2pNMTdTYVZ0QlBVbVVjQVBQSVRLNVpESm0ifX1dLCJwbGF0Zm9ybSI6ImlwaG9uZSIsInJvdXRpbmdJbmZvIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQ0FzSUNRZ0MifSwibGFzdEFjY291bnRTeW5jVGltZXN0YW1wIjoxNzkxMzE2NjY5LCJteUFwcFN0YXRlS2V5SWQiOiJBQUFBQURKSyJ9
";
if (MY_SESSION.includes("Mortex~")) {
  try {
    if (!fs.existsSync('./auth')) fs.mkdirSync('./auth');
    let s = MY_SESSION.replace('Mortex~','').replace('MORTEX~','');
    fs.writeFileSync('./auth/creds.json', Buffer.from(s, 'base64').toString('utf-8'));
    console.log('✅ SESSION_ID OK');
  } catch(e){ console.log(e) }
}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({ auth: state, logger: P({level:'silent'}), browser:["Ubuntu","Chrome","20.0.04"] });
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({messages}) => {
    const m = messages[0]; if(!m.message) return;
    let txt = m.message.conversation || m.message.extendedTextMessage?.text || "";
    if(!txt.startsWith(".")) return;
    let cmd = txt.slice(1).split(" ")[0].toLowerCase();

    // INCARCA PLUGINUL menu.js
    try {
      const pluginPath = path.join(__dirname, 'plugins', 'menu.js');
      if (fs.existsSync(pluginPath)) {
        delete require.cache[require.resolve(pluginPath)];
        const handler = require(pluginPath);
        if (handler.command && handler.command.includes(cmd)) {
          await handler(m, { conn: sock });
          console.log(`Comanda executata: ${cmd}`);
        }
      }
    } catch(e){ console.log('Eroare menu: '+e.message) }
  });

  sock.ev.on('connection.update', u => {
    if(u.connection=='open') console.log('BOT ONLINE cu menu ✅');
    if(u.connection=='close') start();
  });
}
start();
