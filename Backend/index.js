import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import responses from "./lib/responses.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/api/hallo", (req, res) => {
  const { question } = req.body;
  const lowerCaseText = question.toLowerCase();
  const words = lowerCaseText.split(/\s+/);
  let responseText = [];
  for (const [keyword, reply] of Object.entries(responses)) {
    const keywordWords = keyword.split(/\s+/);
    if (keywordWords.length > 1 && lowerCaseText.includes(keyword)) {
      responseText.push(reply);
    }
  }
  for (const [keyword, reply] of Object.entries(responses)) {
    const keywordWords = keyword.split(/\s+/);
    if (keywordWords.length === 1 && words.includes(keyword)) {
      responseText.push(reply);
    }
  }

  if (responseText.length === 0) {
    responseText.push("Ich verstehe deine Anfrage nicht.");
  }

  res.send(responseText.join(" "));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the server`);
});
