import type { WardenClient } from '#src/lib/util/common.d.js';
import { logger } from '#src/lib/util/common.js';
import { version } from '#src/lib/util/version.js';
import { ActivityType } from 'discord.js';

export default {
    name: 'ready',
    once: true,
    async execute(client: WardenClient): Promise<void> {
        const { startup } = await import('#src/main.js');
        startup.started = true;
        logger.info({
            message: `Connected. Logged in as ${client.user.tag}.`,
            label: 'Discord',
        });
        logger.info({
            message: `Running version ${version}. For help, see https://github.com/ZPTXDev/Warden/issues.`,
            label: 'Warden',
        });
        if (version.includes('-')) {
            logger.warn({
                message:
                    'You are running an unstable version of Warden. Please report bugs using the link above, and note that features may change or be removed entirely prior to release.',
                label: 'Warden',
            });
        }
        client.user.setActivity(`users | ${version}`, {
            type: ActivityType.Watching,
        });
        client.tts.connect(client.user.id);
    },
};
