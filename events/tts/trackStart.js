const { logger } = require('../../shared.js');

module.exports = {
	name: 'trackStart',
	once: false,
	async execute(queue) {
		logger.info({ message: `[G ${queue.player.guildId}] Starting track`, label: 'Quaver' });
		if (queue.player.timeout) {
			clearTimeout(queue.player.timeout);
			delete queue.player.timeout;
		}
	},
};
