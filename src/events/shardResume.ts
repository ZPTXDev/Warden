import { logger } from '#src/lib/util/common.js';
import { version } from '#src/lib/util/version.js';
import { ActivityType } from 'discord.js';

export default {
    name: 'shardResume',
    once: false,
    async execute(): Promise<void> {
        const { bot } = await import('#src/main.js');
        bot.user.setActivity(`users | ${version}`, {
            type: ActivityType.Watching,
        });
        logger.info({ message: 'Reconnected.', label: 'Discord' });
    },
};
