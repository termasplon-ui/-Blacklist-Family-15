import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";

export function mainButtons(): ActionRowBuilder<ButtonBuilder>[] {
  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_view_blacklist")
      .setLabel("🔍 Просмотр ЧС игрока")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("btn_history")
      .setLabel("📜 История ЧС игрока")
      .setStyle(ButtonStyle.Primary),
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_all_blacklist")
      .setLabel("📌 ЧС всех игроков")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("btn_leaders")
      .setLabel("📍 Список лидеров семьи")
      .setStyle(ButtonStyle.Primary),
  );

  return [row1, row2];
}
