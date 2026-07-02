import { ModalSubmitInteraction } from "discord.js";
import { eq, and, desc, lt, sql } from "drizzle-orm";
import { db, schema } from "./db.js";
import {
  blacklistIssuedEmbed,
  blacklistViewEmbed,
  blacklistRemovedEmbed,
  warningIssuedEmbed,
  historyEmbed,
  allBlacklistEmbed,
  leadersEmbed,
  topEmbed,
} from "./embeds.js";
import { addDays, formatDate } from "./utils.js";
import {
  auditIssueBlacklist,
  auditRemoveBlacklist,
  auditIssueWarning,
  auditAddLeader,
} from "./audit.js";

export async function handleIssueBlacklist(interaction: ModalSubmitInteraction) {
  const nickname = interaction.fields.getTextInputValue("nickname").trim();
  const reason = interaction.fields.getTextInputValue("reason").trim();
  const daysStr = interaction.fields.getTextInputValue("days").trim();
  const amnestyStr = interaction.fields.getTextInputValue("amnesty").trim().toLowerCase();
  const issuedBy = interaction.fields.getTextInputValue("issued_by").trim();

  const days = parseInt(daysStr, 10);
  if (isNaN(days) || days <= 0) {
    await interaction.reply({ content: "❌ Неверное количество дней.", ephemeral: true });
    return;
  }

  const amnesty = amnestyStr === "да" || amnestyStr === "yes";
  const startDate = new Date();
  const endDate = addDays(startDate, days);

  const existing = await db
    .select()
    .from(schema.blacklistTable)
    .where(and(eq(schema.blacklistTable.nickname, nickname), eq(schema.blacklistTable.active, true)));

  if (existing.length > 0) {
    await interaction.reply({ content: `❌ Игрок **${nickname}** уже в чёрном списке.`, ephemeral: true });
    return;
  }

  const [bl] = await db
    .insert(schema.blacklistTable)
    .values({ nickname, reason, issuedBy, startDate, endDate, daysCount: days, amnesty, active: true })
    .returning();

  await interaction.reply({ embeds: [blacklistIssuedEmbed(bl!)] });
  await auditIssueBlacklist(bl!, issuedBy);
}

export async function handleViewBlacklist(interaction: ModalSubmitInteraction) {
  const nickname = interaction.fields.getTextInputValue("nickname").trim();

  const [bl] = await db
    .select()
    .from(schema.blacklistTable)
    .where(and(eq(schema.blacklistTable.nickname, nickname), eq(schema.blacklistTable.active, true)));

  if (!bl) {
    await interaction.reply({ content: `✅ Игрок **${nickname}** не находится в чёрном списке.`, ephemeral: true });
    return;
  }

  await interaction.reply({ embeds: [blacklistViewEmbed(bl)] });
}

export async function handleRemoveBlacklist(interaction: ModalSubmitInteraction) {
  const nickname = interaction.fields.getTextInputValue("nickname").trim();
  const removedBy = interaction.fields.getTextInputValue("removed_by").trim();

  const [bl] = await db
    .select()
    .from(schema.blacklistTable)
    .where(and(eq(schema.blacklistTable.nickname, nickname), eq(schema.blacklistTable.active, true)));

  if (!bl) {
    await interaction.reply({ content: `❌ Активный ЧС для **${nickname}** не найден.`, ephemeral: true });
    return;
  }

  const [updated] = await db
    .update(schema.blacklistTable)
    .set({ active: false, removedBy, removedAt: new Date() })
    .where(eq(schema.blacklistTable.id, bl.id))
    .returning();

  await interaction.reply({ embeds: [blacklistRemovedEmbed(updated!)] });
  await auditRemoveBlacklist(updated!, removedBy);
}

export async function handleHistory(interaction: ModalSubmitInteraction) {
  const nickname = interaction.fields.getTextInputValue("nickname").trim();

  const blacklists = await db
    .select()
    .from(schema.blacklistTable)
    .where(eq(schema.blacklistTable.nickname, nickname))
    .orderBy(desc(schema.blacklistTable.createdAt));

  const warnings = await db
    .select()
    .from(schema.warningsTable)
    .where(eq(schema.warningsTable.nickname, nickname))
    .orderBy(desc(schema.warningsTable.createdAt));

  await interaction.reply({ embeds: [historyEmbed(nickname, blacklists, warnings)] });
}

export async function handleIssueWarning(interaction: ModalSubmitInteraction) {
  const nickname = interaction.fields.getTextInputValue("nickname").trim();
  const reason = interaction.fields.getTextInputValue("reason").trim();
  const issuedBy = interaction.fields.getTextInputValue("issued_by").trim();

  const issuedAt = new Date();
  const expiresAt = addDays(issuedAt, 7);

  const [w] = await db
    .insert(schema.warningsTable)
    .values({ nickname, reason, issuedBy, issuedAt, expiresAt, active: true })
    .returning();

  await interaction.reply({ embeds: [warningIssuedEmbed(w!)] });
  await auditIssueWarning(w!);
}

export async function handleAllBlacklist(channelReply: (opts: any) => Promise<any>) {
  const blacklists = await db
    .select()
    .from(schema.blacklistTable)
    .where(eq(schema.blacklistTable.active, true))
    .orderBy(desc(schema.blacklistTable.createdAt));

  await channelReply({ embeds: [allBlacklistEmbed(blacklists)] });
}

export async function handleLeaders(channelReply: (opts: any) => Promise<any>) {
  const today = new Date();
  const dateStr = formatDate(today);

  const leaders = await db
    .select()
    .from(schema.familyLeadersTable)
    .where(eq(schema.familyLeadersTable.date, dateStr))
    .orderBy(schema.familyLeadersTable.id);

  await channelReply({ embeds: [leadersEmbed(dateStr, leaders)] });
}

export async function handleAddLeader(interaction: ModalSubmitInteraction) {
  const nickname = interaction.fields.getTextInputValue("nickname").trim();
  const family = interaction.fields.getTextInputValue("family").trim();
  const today = formatDate(new Date());

  const [leader] = await db
    .insert(schema.familyLeadersTable)
    .values({ nickname, family, date: today })
    .returning();

  await interaction.reply({ content: `✅ Лидер **${nickname}** (Family: **${family}**) добавлен на ${today}.`, ephemeral: true });
  await auditAddLeader(leader!);
}

export async function handleTop(channelReply: (opts: any) => Promise<any>) {
  const topBl = await db
    .select({
      nickname: schema.blacklistTable.nickname,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(schema.blacklistTable)
    .groupBy(schema.blacklistTable.nickname)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  const topWarn = await db
    .select({
      nickname: schema.warningsTable.nickname,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(schema.warningsTable)
    .groupBy(schema.warningsTable.nickname)
    .orderBy(desc(sql`count(*)`))
    .limit(5);

  await channelReply({ embeds: [topEmbed(topBl, topWarn)] });
}

export async function expireEntries() {
  const now = new Date();

  await db
    .update(schema.blacklistTable)
    .set({ active: false, removedBy: "Автоматически", removedAt: now })
    .where(and(eq(schema.blacklistTable.active, true), lt(schema.blacklistTable.endDate, now)));

  await db
    .update(schema.warningsTable)
    .set({ active: false })
    .where(and(eq(schema.warningsTable.active, true), lt(schema.warningsTable.expiresAt, now)));
}
