import type { WardenQueue } from '#src/lib/util/common.d.js';
import { logger } from '#src/lib/util/common.js';

export default {
    name: 'trackStart',
    once: false,
    execute(queue: WardenQueue): void {
        logger.info({
            message: `[G ${queue.player.guildId}] Starting track`,
            label: 'Warden',
        });
        if (queue.player.timeout) {
            clearTimeout(queue.player.timeout);
            delete queue.player.timeout;
        }
    },
};
