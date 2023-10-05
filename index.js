const { DisconnectReason, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const { default: makeWASocket, Browsers } = require("@whiskeysockets/baileys");

async function connectionlogic() {
  const { state, saveCreds } = await useMultiFileAuthState("authUser-01");
  const client = makeWASocket({
    printQRInTerminal: true,
    browser: Browsers.ubuntu("Server"),
    auth: state,
  });

  client.ev.on("connection.update", async (update) => {
    const { connection, LastDisconnect } = update || {};

    if (connection === "close") {
      const shouldReconnect = LastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        connectionlogic();
      }
    } else if (connection === "open") {
      console.log("\n\nAUTH BERHASIL\n\n");
    }
  });

  client.ev.on("creds.update", saveCreds);

  client.ev.on("messages.upsert", (m) => {
    async function replyTheMsg(id, text) {
      await client.sendMessage(id, { text: text });
    }

    const typeMessage = m.type;
    const fromMe = m.messages[0].key.fromMe;

    if (!fromMe && typeMessage === "notify") {
      replyTheMsg("6282347431338@s.whatsapp.net", "pong");
    }
  });
}

connectionlogic();
