import type { WardenClient, WardenPlayer } from '#src/lib/util/common.d.js';
import { logger } from '#src/lib/util/common.js';
import type { Guild } from 'discord.js';

export default {
    name: 'guildDelete',
    once: false,
    async execute(guild: Guild & { client: WardenClient }): Promise<void> {
        logger.info({
            message: `[G ${guild.id}] Left guild ${guild.name}`,
            label: 'Discord',
        });
        const player = guild.client.tts.players.get(guild.id) as WardenPlayer;
        if (player) {
            logger.info({
                message: `[G ${guild.id}] Cleaning up (left guild)`,
                label: 'Warden',
            });
            player.channelId = null;
            return player.handler.disconnect();
        }
    },
};
