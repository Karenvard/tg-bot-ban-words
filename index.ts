import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";
import axios from "axios";
import fs from "fs";
import speech from "@google-cloud/speech";

config();

const TGBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, {
  polling: true,
});

const client = new speech.SpeechClient({
  apiKey: process.env.GOOGLE_CLOUD_API_KEY,
});

// 🧠 filter
const containsBad = (text: string) =>
  /т+ю+/i.test(text) || /t+u+/i.test(text);

// ⬇️ download voice
const downloadFile = async (url: string, path: string) => {
  const res = await axios.get<{ pipe: (writer: fs.WriteStream) => void }>(url, {
    responseType: "stream",
  });

  const writer = fs.createWriteStream(path);
  res.data.pipe(writer);

  await new Promise((r) => writer.on("finish", r));
};

// 🎧 speech-to-text (NO GCS)
const transcribe = async (filePath: string): Promise<string> => {
  const file = fs.readFileSync(filePath);

  const audio = {
    content: file.toString("base64"),
  };

  const config = {
    encoding: "OGG_OPUS" as const,
    sampleRateHertz: 48000,
    languageCode: "ru-RU",
  };

  const [response] = await client.recognize({
    audio,
    config,
  });


  if (response.results?.length && response.results[0].alternatives?.length) {
    return response.results[0].alternatives[0].transcript || "";
  }
  return "";
};

TGBot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const msgId = msg.message_id;


  if (msg.text) {
    if (containsBad(msg.text)) {
      await TGBot.deleteMessage(chatId, msgId);
    }
    return;
  } else  if (msg.voice) {
    const fileId = msg.voice.file_id;
    const link = await TGBot.getFileLink(fileId);

    const filePath = "./voice.ogg";

    // 1. download
    await downloadFile(link, filePath);

    const text: string = await transcribe(filePath);
    console.log(text);


    if (containsBad(text) || text.trim() === "" || text.includes("YouTube")) {
      await TGBot.deleteMessage(chatId, msgId);
    }

    fs.unlinkSync(filePath);
  }

});