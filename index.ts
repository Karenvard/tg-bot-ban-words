import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";
config();


const TGBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, { polling: true });


const startTelegramBot = () => {
    TGBot.on("message", async msg => {
        const chatId = msg.chat.id;
        const msgId = msg.message_id;
        const msgText = msg.text;
        if ((msgText && /т+ю+/i.test(msgText)) || (msgText && /t+u+/i.test(msgText))) {
            return await TGBot.deleteMessage(chatId, msgId);
        }
    })
}

startTelegramBot();