import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
/* import responses from "./lib/responses.js"; */

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.post("/api/hallo", async (req, res) => {
/*   async function main() {
    const prismaData = Object.entries(responses).map(([question, answer]) => ({
      question,
      answer,
    }));

    for (const data of prismaData) {
      await prisma.questionAndAnswer.create({
        data,
      });
    }
  }

  main()
    .then(() => {
      console.log(
        "Data has been successfully inserted into the Prisma database."
      );
    })
    .catch((e) => {
      console.error(e);
    })
    .finally(async () => {
      await prisma.$disconnect();
    }); */
  const { question } = req.body;
  const lowerCaseText = question.toLowerCase();
  const words = lowerCaseText.split(/\s+/);

  const allResponses = await prisma.questionAndAnswer.findMany();
  const responses = {};
  allResponses.forEach(({ question, answer }) => {
    responses[question] = answer;
  });

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

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});
