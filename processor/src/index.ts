import { PrismaClient } from "@prisma/client";
import { Kafka } from "kafkajs";

const client = new PrismaClient();

const kafka = new Kafka({
  clientId: "outboxprocessor",
  brokers: ["localhost:9092"],
});

async function main() {
  const producer = kafka.producer();
  await producer.connect();

  while (1) {
    const pendingRows = await client.zapRunOutBox.findMany({ take: 10 });

    await producer.send({
      topic: "zap-events",
      messages: pendingRows.map((row) => ({
        value: row.zapRunId,
      })),
    });

    await client.zapRunOutBox.deleteMany({
      where: { id: { in: pendingRows.map((r) => r.id) } },
    });
  }
}
