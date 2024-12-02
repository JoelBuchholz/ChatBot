import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import seed from "./lib/seed.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.post("/api/hallo", async (req, res) => {
  const { question } = req.body;
  const lowerCaseText = question.toLowerCase();
  const words = lowerCaseText.split(/\s+/);

  if (
    question ===
    `User:${process.env.CHATBOT_USER} Password:${process.env.CHATBOT_PASSWORD} Migration`
  ) {
    const prismaData = Object.entries(seed).map(([question, answer]) => ({
      question,
      answer,
    }));

    try {
      const existingQuestions = await prisma.questionAndAnswer.findMany({
        select: { question: true },
      });

      const existingQuestionsSet = new Set(
        existingQuestions.map((q) => q.question)
      );
      let newEntriesCount = 0;

      for (const data of prismaData) {
        if (!existingQuestionsSet.has(data.question)) {
          await prisma.questionAndAnswer.create({
            data,
          });
          newEntriesCount++;
        }
      }

      res.send(`Migration completed. ${newEntriesCount} new entries added.`);
      return;
    } catch (error) {
      console.error("Database connection error:", error);
      res.send("Database connection error");
      return;
    }
  }

  if (
    question.startsWith(
      `User:${process.env.CHATBOT_USER} Password:${process.env.CHATBOT_PASSWORD} Add `
    )
  ) {
    const [_, questionPart, answerPart] = question.match(
      /Question:(.*) Answer:(.*)/
    );
    try {
      if (questionPart && answerPart) {
        await prisma.questionAndAnswer.create({
          data: {
            question: questionPart.trim(),
            answer: answerPart.trim(),
          },
        });
        res.send(
          `Entry added. Question: "${questionPart.trim()}", Answer: "${answerPart.trim()}"`
        );
      } else {
        res.send(
          "Invalid format. Please use 'Question:<your question> Answer:<your answer>'"
        );
      }
      return;
    } catch (error) {
      console.error("Database connection error:", error);
      res.send("Database connection error");
      return;
    }
  }

  if (
    question ===
    `User:${process.env.CHATBOT_USER} Password:${process.env.CHATBOT_PASSWORD} DeleteAll`
  ) {
    try {
      const deleteResult = await prisma.questionAndAnswer.deleteMany({});
      res.send(`All entries deleted. ${deleteResult.count} entries removed.`);
      return;
    } catch (error) {
      console.error("Database connection error:", error);
      res.send("Database connection error");
      return;
    }
  }

  let responses;
  try {
    const allResponses = await prisma.questionAndAnswer.findMany();
    responses = {};
    allResponses.forEach(({ question, answer }) => {
      responses[question] = answer;
    });
  } catch (error) {
    console.error("Database connection error:", error);
    responses = seed;
  }

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

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});
