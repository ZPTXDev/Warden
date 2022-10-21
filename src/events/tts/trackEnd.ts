import type { WardenQueue } from '#src/lib/util/common.d.js';
import { logger } from '#src/lib/util/common.js';
import type { Collection, GuildMember, Snowflake } from 'discord.js';

export default {
    name: 'trackEnd',
    once: false,
    async execute(queue: WardenQueue): Promise<void> {
        const { bot } = await import('#src/main.js');
        const members = bot.guilds.cache
            .get(queue.player.guildId)
            .channels.cache.get(queue.player.channelId).members as Collection<
            Snowflake,
            GuildMember
        >;
        if (members?.filter((m): boolean => !m.user.bot).size < 1) {
            logger.info({
                message: `[G ${queue.player.guildId}] Disconnecting (alone)`,
                label: 'Warden',
            });
            queue.player.handler.locale(
                'TTS.DISCONNECT.ALONE.DISCONNECTED.DEFAULT',
            );
            return queue.player.handler.disconnect();
        }
    },
};
