import type { WardenQueue } from '#src/lib/util/common.d.js';
import { logger } from '#src/lib/util/common.js';

export default {
	name: 'queueFinish',
	once: false,
	execute(queue: WardenQueue): void {
		logger.info({ message: `[G ${queue.player.guildId}] Setting timeout`, label: 'Warden' });
		if (queue.player.timeout) clearTimeout(queue.player.timeout);
		queue.player.timeout = setTimeout((p): void => {
			logger.info({ message: `[G ${p.guildId}] Disconnecting (inactivity)`, label: 'Warden' });
			p.handler.locale('TTS.DISCONNECT.INACTIVITY.DISCONNECTED', { type: 'warning' });
			p.handler.disconnect();
		}, 1800000, queue.player);
	},
};
