import type { WardenInteraction } from '#src/lib/util/common.d.js';
import { confirmationTimeout, data, logger } from '#src/lib/util/common.js';
import { settings } from '#src/lib/util/settings.js';
import {
    buildMessageOptions,
    buildSettingsPage,
    getGuildLocaleString,
    getLocaleString,
} from '#src/lib/util/util.js';
import type {
    ButtonInteraction,
    MessageActionRowComponentBuilder,
    SelectMenuComponent,
} from 'discord.js';
import { ActionRowBuilder, EmbedBuilder, SelectMenuBuilder } from 'discord.js';

export default {
    name: 'prepend',
    async execute(
        interaction: WardenInteraction<ButtonInteraction>,
    ): Promise<void> {
        if (interaction.message.interaction.user.id !== interaction.user.id) {
            await interaction.replyHandler.locale(
                'DISCORD.INTERACTION.USER_MISMATCH',
                { type: 'error' },
            );
            return;
        }
        if (!confirmationTimeout[interaction.message.id]) {
            await interaction.replyHandler.locale(
                'DISCORD.INTERACTION.EXPIRED',
                { components: [], force: 'update' },
            );
            return;
        }
        clearTimeout(confirmationTimeout[interaction.message.id]);
        confirmationTimeout[interaction.message.id] = setTimeout(
            async (message): Promise<void> => {
                try {
                    await message.edit(
                        buildMessageOptions(
                            new EmbedBuilder().setDescription(
                                await getGuildLocaleString(
                                    message.guildId,
                                    'DISCORD.INTERACTION.EXPIRED',
                                ),
                            ),
                            { components: [] },
                        ),
                    );
                } catch (error) {
                    if (error instanceof Error) {
                        logger.error({
                            message: `${error.message}\n${error.stack}`,
                            label: 'Warden',
                        });
                    }
                }
                delete confirmationTimeout[message.id];
            },
            30 * 1000,
            interaction.message,
        );
        const option = interaction.customId.split('_')[1];
        await data.guild.set(interaction.guildId, 'settings.prepend', option);
        const guildLocaleCode =
            (await data.guild.get<string>(
                interaction.guildId,
                'settings.locale',
            )) ?? settings.defaultLocaleCode;
        const { current, embeds, actionRow } = await buildSettingsPage(
            interaction,
            guildLocaleCode,
            'prepend',
        );
        const description = `${getLocaleString(
            guildLocaleCode,
            'CMD.SETTINGS.RESPONSE.HEADER',
            interaction.guild.name,
        )}\n\n**${getLocaleString(
            guildLocaleCode,
            'CMD.SETTINGS.MISC.PREPEND.NAME',
        )}** ─ ${getLocaleString(
            guildLocaleCode,
            'CMD.SETTINGS.MISC.PREPEND.DESCRIPTION',
        )}\n> ${getLocaleString(
            guildLocaleCode,
            'MISC.CURRENT',
        )}: \`${current}\``;
        await interaction.replyHandler.reply([description, ...embeds], {
            components: [
                new ActionRowBuilder<SelectMenuBuilder>().addComponents(
                    SelectMenuBuilder.from(
                        interaction.message.components[0]
                            .components[0] as SelectMenuComponent,
                    ),
                ),
                actionRow as ActionRowBuilder<MessageActionRowComponentBuilder>,
            ],
            force: 'update',
        });
    },
};
