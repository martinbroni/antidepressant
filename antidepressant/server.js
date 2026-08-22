import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({limit: "32kb"}));
app.use(express.static(__dirname));

app.post("/api/answer", async (req, res) => {
  if (req.body?.answer !== "yes") {
    return res.status(400).json({ok:false});
  }

  // Never put TELEGRAM_BOT_TOKEN or CHAT_ID in frontend code.
  // Set them as server environment variables.
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const message = [
    "Она согласилась ❤️",
    `Время: ${req.body.timestamp || new Date().toISOString()}`,
    `Страница: ${req.body.page || "unknown"}`
  ].join("\n");

  if (token && chatId) {
    const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const tg = await fetch(telegramUrl, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({chat_id: chatId, text: message})
    });
    if (!tg.ok) {
      return res.status(502).json({ok:false, error:"Notification failed"});
    }
  } else {
    console.log("[DEMO] Agreement received:", message);
  }

  res.json({ok:true});
});

app.listen(PORT, () => {
  console.log(`Romantic landing: http://localhost:${PORT}`);
});
