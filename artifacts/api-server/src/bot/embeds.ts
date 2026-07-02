import { EmbedBuilder, ColorResolvable } from "discord.js";
import type { Blacklist, Warning, FamilyLeader } from "@workspace/db";
import { formatDate, progressBar } from "./utils.js";

export function blacklistIssuedEmbed(bl: Blacklist): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("🛑 чёрный список семьи 🛑")
    .setColor(0xe74c3c)
    .addFields(
      { name: "Никнейм", value: bl.nickname, inline: true },
      { name: "За что было выдано ЧС", value: bl.reason },
      { name: "От скольки до скольки длится ЧС", value: `${formatDate(bl.startDate)} → ${formatDate(bl.endDate)}` },
      { name: "Есть ли возможность амнистии", value: bl.amnesty ? "✅ Да" : "❌ Нет", inline: true },
      { name: "Кто выдавал", value: bl.issuedBy, inline: true },
      { name: "Прогресс", value: progressBar(bl.startDate, bl.endDate) },
    )
    .setTimestamp();
}

export function blacklistViewEmbed(bl: Blacklist): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(`🛑 чёрный список семьи игрока: ${bl.nickname} 🛑`)
    .setColor(0xe74c3c)
    .addFields(
      { name: "Никнейм", value: bl.nickname, inline: true },
      { name: "За что было выдано ЧС", value: bl.reason },
      { name: "От скольки до скольки длится ЧС", value: `${formatDate(bl.startDate)} → ${formatDate(bl.endDate)}` },
      { name: "Есть ли возможность амнистии", value: bl.amnesty ? "✅ Да" : "❌ Нет", inline: true },
      { name: "Кто выдавал", value: bl.issuedBy, inline: true },
      { name: "Прогресс", value: progressBar(bl.startDate, bl.endDate) },
    )
    .setTimestamp();
}

export function blacklistRemovedEmbed(bl: Blacklist): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("✅ чёрный список семьи снят ✅")
    .setColor(0x2ecc71)
    .addFields(
      { name: "Никнейм", value: bl.nickname, inline: true },
      { name: "Кто снял ЧС", value: bl.removedBy ?? "Неизвестно", inline: true },
    )
    .setTimestamp();
}

export function warningIssuedEmbed(w: Warning): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("⚠️ предупреждение семьи ⚠️")
    .setColor(0xf39c12)
    .addFields(
      { name: "Никнейм", value: w.nickname, inline: true },
      { name: "Причина", value: w.reason },
      { name: "Снимается автоматически", value: formatDate(w.expiresAt), inline: true },
      { name: "От кого было выдано", value: w.issuedBy, inline: true },
    )
    .setTimestamp();
}

export function historyEmbed(
  nickname: string,
  blacklists: Blacklist[],
  warnings: Warning[],
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(`📜 история чёрного списка семьи игрока: ${nickname} 📜`)
    .setColor(0x9b59b6);

  if (blacklists.length === 0 && warnings.length === 0) {
    embed.setDescription("История пуста.");
    return embed;
  }

  if (blacklists.length > 0) {
    const blText = blacklists.map((bl, i) =>
      `**${i + 1}.** ${formatDate(bl.startDate)} → ${formatDate(bl.endDate)} | ${bl.reason} | Выдал: ${bl.issuedBy} | Статус: ${bl.active ? "🔴 Активен" : "✅ Снят"}`
    ).join("\n");
    embed.addFields({ name: "Чёрные списки", value: blText.slice(0, 1024) });
  }

  if (warnings.length > 0) {
    const wText = warnings.map((w, i) =>
      `**${i + 1}.** ${formatDate(w.issuedAt)} | ${w.reason} | Выдал: ${w.issuedBy} | Статус: ${w.active ? "⚠️ Активно" : "✅ Снято"}`
    ).join("\n");
    embed.addFields({ name: "Предупреждения", value: wText.slice(0, 1024) });
  }

  return embed;
}

export function allBlacklistEmbed(blacklists: Blacklist[]): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle("📌 чёрный список всех игроков 📌")
    .setColor(0xe74c3c);

  if (blacklists.length === 0) {
    embed.setDescription("Чёрный список пуст.");
    return embed;
  }

  const text = blacklists.map((bl, i) =>
    `**${i + 1}.** ${bl.nickname} — ${bl.reason} | ${formatDate(bl.startDate)} → ${formatDate(bl.endDate)}`
  ).join("\n");

  embed.setDescription(text.slice(0, 4096));
  return embed;
}

export function leadersEmbed(date: string, leaders: FamilyLeader[]): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(`📍 актуальный список лидеров семьи за ${date} 📍`)
    .setColor(0x3498db);

  if (leaders.length === 0) {
    embed.setDescription("Список лидеров пуст.");
    return embed;
  }

  const text = leaders.map((l, i) =>
    `**${i + 1}.** ${l.nickname}  Family: ${l.family}`
  ).join("\n");

  embed.setDescription(text);
  return embed;
}
