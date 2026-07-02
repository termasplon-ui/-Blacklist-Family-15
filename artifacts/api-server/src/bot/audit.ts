import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { eq } from "drizzle-orm";
import { db, schema } from "./db.js";
import { formatDate } from "./utils.js";
import type { Blacklist, Warning, FamilyLeader } from "@workspace/db";

let botClient: Client | null = null;

export function setBotClient(client: Client) {
  botClient = client;
}

async function getLogChannelId(): Promise<string | null> {
  const [row] = await db
    .select()
    .from(schema.botSettingsTable)
    .where(eq(schema.botSettingsTable.key, "log_channel_id"));
  return row?.value ?? null;
}

async function sendAudit(embed: EmbedBuilder) {
  if (!botClient) return;
  const channelId = await getLogChannelId();
  if (!channelId) return;

  try {
    const channel = await botClient.channels.fetch(channelId);
    if (channel instanceof TextChannel) {
      await channel.send({ embeds: [embed] });
    }
  } catch {
    // channel not found or no perms — skip silently
  }
}

export async function auditIssueBlacklist(bl: Blacklist, issuedBy: string) {
  const embed = new EmbedBuilder()
    .setTitle("📋 AUDIT · Выдан чёрный список")
    .setColor(0xe74c3c)
    .addFields(
      { name: "Игрок", value: bl.nickname, inline: true },
      { name: "Выдал", value: issuedBy, inline: true },
      { name: "Причина", value: bl.reason },
      { name: "Срок", value: `${formatDate(bl.startDate)} → ${formatDate(bl.endDate)} (${bl.daysCount} дн.)`, inline: true },
      { name: "Амнистия", value: bl.amnesty ? "✅ Да" : "❌ Нет", inline: true },
    )
    .setTimestamp();
  await sendAudit(embed);
}

export async function auditRemoveBlacklist(bl: Blacklist, removedBy: string) {
  const embed = new EmbedBuilder()
    .setTitle("📋 AUDIT · Снят чёрный список")
    .setColor(0x2ecc71)
    .addFields(
      { name: "Игрок", value: bl.nickname, inline: true },
      { name: "Снял", value: removedBy, inline: true },
      { name: "Причина ЧС была", value: bl.reason },
    )
    .setTimestamp();
  await sendAudit(embed);
}

export async function auditIssueWarning(w: Warning) {
  const embed = new EmbedBuilder()
    .setTitle("📋 AUDIT · Выдано предупреждение")
    .setColor(0xf39c12)
    .addFields(
      { name: "Игрок", value: w.nickname, inline: true },
      { name: "Выдал", value: w.issuedBy, inline: true },
      { name: "Причина", value: w.reason },
      { name: "Истекает", value: formatDate(w.expiresAt), inline: true },
    )
    .setTimestamp();
  await sendAudit(embed);
}

export async function auditAddLeader(leader: FamilyLeader) {
  const embed = new EmbedBuilder()
    .setTitle("📋 AUDIT · Добавлен лидер семьи")
    .setColor(0x3498db)
    .addFields(
      { name: "Никнейм", value: leader.nickname, inline: true },
      { name: "Семья", value: leader.family, inline: true },
      { name: "Дата", value: leader.date, inline: true },
    )
    .setTimestamp();
  await sendAudit(embed);
}
