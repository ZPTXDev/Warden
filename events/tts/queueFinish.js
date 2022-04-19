const { logger } = require('../../shared.js');

module.exports = {
	name: 'queueFinish',
	once: false,
	execute(queue) {
		logger.info({ message: `[G ${queue.player.guildId}] Setting timeout`, label: 'Quaver' });
		if (queue.player.timeout) {
			clearTimeout(queue.player.timeout);
		}
		queue.player.timeout = setTimeout(p => {
			logger.info({ message: `[G ${p.guildId}] Disconnecting (inactivity)`, label: 'Quaver' });
			p.ttsHandler.locale('TTS_INACTIVITY');
			p.ttsHandler.disconnect();
		}, 1800000, queue.player);
	},
};
