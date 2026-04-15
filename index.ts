import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import express from "express";
dotenv.config();

const app = express();
const TGBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, { polling: true });


TGBot.on("message", async msg => {
  const chatId = msg.chat.id;
  const msgId = msg.message_id;
  const msgText = msg.text;
  if ((msgText && /т+ю+/i.test(msgText)) || (msgText && /t+u+/i.test(msgText))) {
    return await TGBot.deleteMessage(chatId, msgId);
  }
})

app.get("/", (req, res) => {
  res.status(200).send("OK");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
