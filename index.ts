import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";
config();


const TGBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, { polling: true });


const startTelegramBot = () => {
    TGBot.on("message", async msg => {
        const chatId = msg.chat.id;
        const msgId = msg.message_id;
        const msgText = msg.text;
        console.log("msgText: ",msgText);
        if (msgText?.toLocaleLowerCase().split(" ").includes("тю")) {
            return await TGBot.deleteMessage(chatId, msgId);
        }
    })
}

startTelegramBot();