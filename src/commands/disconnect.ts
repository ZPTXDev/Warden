import type {
    WardenInteraction,
    WardenPlayer,
} from '#src/lib/util/common.d.js';
import { checks } from '#src/lib/util/constants.js';
import { settings } from '#src/lib/util/settings.js';
import { getLocaleString } from '#src/lib/util/util.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('disconnect')
        .setDescription(
            getLocaleString(
                settings.defaultLocaleCode,
                'CMD.DISCONNECT.DESCRIPTION',
            ),
        ),
    checks: [
        checks.GUILD_ONLY,
        checks.ACTIVE_SESSION,
        checks.IN_VOICE,
        checks.IN_SESSION_VOICE,
    ],
    permissions: {
        user: [],
        bot: [],
    },
    async execute(
        interaction: WardenInteraction<ChatInputCommandInteraction>,
    ): Promise<void> {
        const player = interaction.client.tts.players.get(
            interaction.guildId,
        ) as WardenPlayer;
        clearTimeout(player.timeout);
        player.disconnect();
        interaction.client.tts.destroyPlayer(interaction.guildId);
        await interaction.replyHandler.locale(
            'CMD.DISCONNECT.RESPONSE.SUCCESS',
        );
    },
};
