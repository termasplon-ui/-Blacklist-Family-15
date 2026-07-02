import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";

export function issueBlacklistModal(): ModalBuilder {
  return new ModalBuilder()
    .setCustomId("modal_issue_blacklist")
    .setTitle("Выдача ЧС семьи")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("nickname")
          .setLabel("Никнейм")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder("Введите никнейм игрока"),
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("reason")
          .setLabel("Причина чёрного списка")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setPlaceholder("Укажите причину"),
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("days")
          .setLabel("Сколько дней ЧС")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder("Например: 30"),
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("amnesty")
          .setLabel("Возможна ли амнистия? (да/нет)")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder("да или нет"),
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("issued_by")
          .setLabel("Кто выдал ЧС")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder("Ваш никнейм"),
      ),
    );
}

export function removeBlacklistModal(): ModalBuilder {
  return new ModalBuilder()
    .setCustomId("modal_remove_blacklist")
    .setTitle("Снятие ЧС семьи")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("nickname")
          .setLabel("Никнейм игрока")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder("Введите никнейм игрока"),
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("removed_by")
          .setLabel("Кто снимает ЧС")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder("Ваш никнейм"),
      ),
    );
}

export function viewBlacklistModal(): ModalBuilder {
  return new ModalBuilder()
    .setCustomId("modal_view_blacklist")
    .setTitle("Просмотр ЧС игрока")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("nickname")
          .setLabel("Никнейм игрока")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder("Введите никнейм игрока"),
      ),
    );
}

export function historyModal(): ModalBuilder {
  return new ModalBuilder()
    .setCustomId("modal_history")
    .setTitle("История ЧС игрока")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("nickname")
          .setLabel("Никнейм игрока")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder("Введите никнейм игрока"),
      ),
    );
}

export function issueWarningModal(): ModalBuilder {
  return new ModalBuilder()
    .setCustomId("modal_issue_warning")
    .setTitle("Выдача предупреждения")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("nickname")
          .setLabel("Никнейм")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder("Введите никнейм игрока"),
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("reason")
          .setLabel("Причина предупреждения")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setPlaceholder("Укажите причину"),
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("issued_by")
          .setLabel("От кого выдано")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder("Ваш никнейм"),
      ),
    );
}

export function addLeaderModal(): ModalBuilder {
  return new ModalBuilder()
    .setCustomId("modal_add_leader")
    .setTitle("Добавить лидера семьи")
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("nickname")
          .setLabel("Никнейм лидера")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder("Например: Vika_Sokol"),
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("family")
          .setLabel("Семья")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setPlaceholder("Например: Gold"),
      ),
    );
}
