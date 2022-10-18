import type { WardenInteraction } from '#src/lib/util/common.d.js';
import { checks } from '#src/lib/util/constants.js';
import { settings } from '#src/lib/util/settings.js';
import { getLocaleString } from '#src/lib/util/util.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('cancel')
        .setDescription(
            getLocaleString(
                settings.defaultLocaleCode,
                'CMD.CANCEL.DESCRIPTION',
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
        const player = interaction.client.tts.players.get(interaction.guildId);
        if (!player.queue.current || (!player.playing && !player.paused)) {
            await interaction.replyHandler.locale(
                'TTS.PLAYER.PLAYING.NOTHING',
                { type: 'error' },
            );
            return;
        }
        player.queue.clear();
        await player.queue.skip();
        await player.queue.start();
        await interaction.replyHandler.locale('CMD.CANCEL.RESPONSE.SUCCESS');
    },
};
