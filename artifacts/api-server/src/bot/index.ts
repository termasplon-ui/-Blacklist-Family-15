import {
  Client,
  GatewayIntentBits,
  Events,
  EmbedBuilder,
  ButtonInteraction,
  ModalSubmitInteraction,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import { eq } from "drizzle-orm";
import { mainButtons } from "./buttons.js";
import {
  issueBlacklistModal,
  removeBlacklistModal,
  viewBlacklistModal,
  historyModal,
  issueWarningModal,
  addLeaderModal,
} from "./modals.js";
import {
  handleIssueBlacklist,
  handleViewBlacklist,
  handleRemoveBlacklist,
  handleHistory,
  handleIssueWarning,
  handleAllBlacklist,
  handleLeaders,
  handleAddLeader,
  handleTop,
  expireEntries,
} from "./handlers.js";
import { setBotClient } from "./audit.js";
import { db, schema } from "./db.js";
import { logger } from "../lib/logger.js";

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  throw new Error("DISCORD_BOT_TOKEN is required");
}

const commands = [
  new SlashCommandBuilder()
    .setName("панель")
    .setDescription("Открыть панель просмотра (ЧС, история, лидеры)"),

  new SlashCommandBuilder()
    .setName("выдать-чс")
    .setDescription("Выдать чёрный список игроку семьи"),

  new SlashCommandBuilder()
    .setName("снять-чс")
    .setDescription("Снять чёрный список с игрока"),

  new SlashCommandBuilder()
    .setName("предупреждение")
    .setDescription("Выдать предупреждение игроку (снимается через 7 дней)"),

  new SlashCommandBuilder()
    .setName("добавить-лидера")
    .setDescription("Добавить лидера семьи на сегодня"),

  new SlashCommandBuilder()
    .setName("топ")
    .setDescription("Топ-5 игроков с наибольшим количеством ЧС и предупреждений"),

  new SlashCommandBuilder()
    .setName("установить-канал-логов")
    .setDescription("Установить канал для audit log (только администраторы)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
].map((cmd) => cmd.toJSON());

export function startBot() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  setBotClient(client);

  client.once(Events.ClientReady, async (c) => {
    logger.info(`Discord bot ready as ${c.user.tag}`);

    try {
      const rest = new REST().setToken(token!);
      await rest.put(Routes.applicationCommands(c.user.id), { body: commands });
      logger.info("Slash commands registered");
    } catch (err) {
      logger.error({ err }, "Failed to register slash commands");
    }

    setInterval(async () => {
      try {
        await expireEntries();
      } catch (err) {
        logger.error({ err }, "Error in expiry check");
      }
    }, 10 * 60 * 1000);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        const name = interaction.commandName;

        if (name === "панель") {
          const embed = new EmbedBuilder()
            .setTitle("🏠 Панель управления семьёй")
            .setDescription("Выберите действие с помощью кнопок ниже:")
            .setColor(0x5865f2);
          await interaction.reply({ embeds: [embed], components: mainButtons() });

        } else if (name === "выдать-чс") {
          await interaction.showModal(issueBlacklistModal());

        } else if (name === "снять-чс") {
          await interaction.showModal(removeBlacklistModal());

        } else if (name === "предупреждение") {
          await interaction.showModal(issueWarningModal());

        } else if (name === "добавить-лидера") {
          await interaction.showModal(addLeaderModal());

        } else if (name === "топ") {
          await handleTop((opts) => interaction.reply(opts));

        } else if (name === "установить-канал-логов") {
          const channel = interaction.channel;
          if (!channel || channel.type !== ChannelType.GuildText) {
            await interaction.reply({ content: "❌ Используйте эту команду в текстовом канале.", ephemeral: true });
            return;
          }

          await db
            .insert(schema.botSettingsTable)
            .values({ key: "log_channel_id", value: channel.id })
            .onConflictDoUpdate({
              target: schema.botSettingsTable.key,
              set: { value: channel.id, updatedAt: new Date() },
            });

          await interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("✅ Канал логов установлен")
                .setDescription(`Все действия (ЧС, предупреждения, лидеры) теперь будут записываться в <#${channel.id}>`)
                .setColor(0x2ecc71),
            ],
            ephemeral: true,
          });
        }

      } else if (interaction.isButton()) {
        await handleButton(interaction);
      } else if (interaction.isModalSubmit()) {
        await handleModal(interaction);
      }
    } catch (err) {
      logger.error({ err }, "Error handling interaction");
      if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: "❌ Произошла ошибка. Попробуйте снова.", ephemeral: true });
      }
    }
  });

  async function handleButton(interaction: ButtonInteraction) {
    switch (interaction.customId) {
      case "btn_view_blacklist":
        await interaction.showModal(viewBlacklistModal());
        break;
      case "btn_history":
        await interaction.showModal(historyModal());
        break;
      case "btn_all_blacklist":
        await handleAllBlacklist((opts) => interaction.reply(opts));
        break;
      case "btn_leaders":
        await handleLeaders((opts) => interaction.reply(opts));
        break;
    }
  }

  async function handleModal(interaction: ModalSubmitInteraction) {
    switch (interaction.customId) {
      case "modal_issue_blacklist":
        await handleIssueBlacklist(interaction);
        break;
      case "modal_view_blacklist":
        await handleViewBlacklist(interaction);
        break;
      case "modal_remove_blacklist":
        await handleRemoveBlacklist(interaction);
        break;
      case "modal_history":
        await handleHistory(interaction);
        break;
      case "modal_issue_warning":
        await handleIssueWarning(interaction);
        break;
      case "modal_add_leader":
        await handleAddLeader(interaction);
        break;
    }
  }

  client.login(token).catch((err) => {
    logger.error({ err }, "Failed to login to Discord");
    process.exit(1);
  });

  return client;
}
