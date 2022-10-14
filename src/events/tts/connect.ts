import { logger } from '#src/lib/util/common.js';

export default {
	name: 'connect',
	once: false,
	execute(): void {
		logger.info({ message: 'Connected.', label: 'Lavalink' });
	},
};
