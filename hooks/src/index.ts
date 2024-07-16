import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const app = express();

app.use(express.json());

app.post("/hooks/catch/:userId/:zapId", async (req, res) => {
  const { userId, zapId } = req.params;
  const body = req.body;
  // store in db new trigger
  await prisma.$transaction(async (tx) => {
    const run = await tx.zapRun.create({ data: { zapId, metaData: body } });
    await tx.zapRunOutBox.create({
      data: { zapRunId: run.id },
    });
  });
  res.json({ message: "webhook received" });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
