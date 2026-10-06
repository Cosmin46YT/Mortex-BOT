const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');

const MY_SESSION = "Mortex~eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiK01KMkI1WXcrSlVJM3ZDRUZHQzZEcFI2R2RPelhZQXJ2T0pnekl1a2gzQT0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiNndqOFM1OGVkcjcwVFZ3R3ZvaGVFU0Z2c0d3RVpjL0FTN3JtTUhIU0pSbz0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJTTTZ0Z1BBbWR2bTAzaEYwbWJWeXhKcG9LYmQ4dXd4MGZRajhCV1daUVgwPSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJsU1pmK2ViTy9hSWVRQjV1eUxTQWlWelFFMnR4anJFVkQxNnpGaWFrTW5nPSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IjBBQWVhNldwbXFUd0haNjBmM2tUQlNrdVd5eFpsR0FCY3dBdkFDODNhbVE9In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6ImY5cGZmR2dUWjc1OTZiM3lxdGp5QURydmY3Zk5iOU53U0VaY2x3cDJad0E9In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiS05NcEZhYUp3OUw2WVkwSGJqdUxGNXVSVjhmZWxUR1BXdG5uQTRxd1hVMD0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoialBTVXVnNGpwQmNGdHdmZndUb1h4enZZajh3K200QTZRQkM1K2RreHRXbz0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IjJhdDF5MnRHbStrTWlWcFVEMUtJR2VVQnp1QUNLQXJ4VmlzalFZN3JjcTNvcGRKZW9XUEl3Y3IxcmZkS0tSeUZVa3NrLy83YXkyTFJ3YXVyaUpnd2h3PT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6MTk0LCJhZHZTZWNyZXRLZXkiOiJjUmhUNFRXeUVFK3VwQ2xFWHIyQ2QyS2laV244UzBtOGdMb0RSUWF4a0RJPSIsInByb2Nlc3NlZEhpc3RvcnlNZXNzYWdlcyI6W10sIm5leHRQcmVLZXlJZCI6MzEsImZpcnN0VW51cGxvYWRlZFByZUtleUlkIjozMSwiYWNjb3VudFN5bmNDb3VudGVyIjowLCJhY2NvdW50U2V0dGluZ3MiOnsidW5hcmNoaXZlQ2hhdHMiOmZhbHNlfSwicmVnaXN0cmF0ZWQiOnRydWUsInBhaXJpbmdDb2RlIjoiNjdIVEJGNjgiLCJtZSI6eyJpZCI6IjQwNzcwODExOTI5OjE0QHMud2hhdHNhcHAubmV0IiwibGlkIjoiMTExNzQyOTE5MTc2MzQ2OjE0QGxpZCIsIm5hbWUiOiJDb3NtaW4g8K8vIn0sImFjY291bnQiOnsiZGV0YWlscyI6IkNJVFl6djRORUxhYmxkWUdHQUVnQUNnQSIsImFjY291bnRTaWduYXR1cmVLZXkiOiJ5djJCZDVtTUNaQWhNdldUc0tNelh0SnBXMEU5U1pSd0E4OGhNcmxrTW1ZPSIsImFjY291bnRTaWduYXR1cmUiOiJJWi8rY1Y1bU1CZ3NSTm9VemhIcGJyWFJkUk8xYWZtQm9oeHN3cGdZQmRXZkkrZzNCeHBCaW1WbHFEalAwc2ViTDYyaGdwSno4VSt2amYvdmNYc2dRPT0iLCJkZXZpY2VTaWduYXR1cmUiOiJtUkNtSm9OMzRwVGFSVmFucWE1R2x2Ni91STlKc05ibldQcXpaZW5aVS9HNDBFWDF0Yk1UYlZpWjZ6cDNKb05rVS95dlZFU2NKaEFGM2pTVnREcjFpQT09In0sInNpZ25hbElkZW50aXRpZXMiOlt7ImlkZW50aWZpZXIiOnsibmFtZSI6IjQwNzcwODExOTI5OjE0QHMud2hhdHNhcHAubmV0IiwiZGV2aWNlSWQiOjB9LCJpZGVudGlmaWVyS2V5Ijp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQmNyOWdYZVpqQW1RSVRGY0U3Q2pNMTdTYVZ0QlBVbVVjQVBQSVRLNVpESm0ifX1dLCJwbGF0Zm9ybSI6ImlwaG9uZSIsInJvdXRpbmdJbmZvIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQ0FnSUFnZ1MifSwibGFzdEFjY291bnRTeW5jVGltZXN0YW1wIjoxNzkxMzE2NjY5LCJteUFwcFN0YXRlS2V5SWQiOiJBQUFBQURKSyJ9";

if (MY_SESSION.includes("Mortex~")) {
  if (!fs.existsSync('./auth')) fs.mkdirSync('./auth');
  let s = MY_SESSION.replace('Mortex~','').replace('MORTEX~','');
  fs.writeFileSync('./auth/creds.json', Buffer.from(s, 'base64').toString('utf-8'));
  console.log('✅ SESSION_ID OK');
}

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const sock = makeWASocket({ auth: state, logger: P({level:'silent'}), browser:["Ubuntu","Chrome","20.0.04"] });
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({messages}) => {
    let m = messages[0];
   if(!m.message) return; 
    m.chat = m.key.remoteJid;
    let txt = m.message.conversation || m.message.extendedTextMessage?.text || "";
    if(!txt.startsWith(".")) return;
    let cmd = txt.slice(1).split(" ")[0].toLowerCase();
    console.log('Comanda: '+cmd);
    try {
      const pPath = path.join(__dirname, 'plugins', 'menu.js');
      if (fs.existsSync(pPath)) {
        delete require.cache[require.resolve(pPath)];
        const handler = require(pPath);
        if (handler.command && handler.command.includes(cmd)) {
          await handler(m, { conn: sock });
        }
      }
    } catch(e){ console.log('Eroare menu: '+e.message) }
  });

  sock.ev.on('connection.update', u => {
    if(u.connection=='open') console.log('✅ BOT ONLINE CU MENU');
    if(u.connection=='close') start();
  });
}
start();
