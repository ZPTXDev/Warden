const { logger } = require('../shared.js');
const { version } = require('../package.json');

module.exports = {
	name: 'ready',
	once: false,
	async execute(client) {
		const { startup, updateStartup } = require('../main.js');
		if (!startup) {
			logger.info({ message: `Connected. Logged in as ${client.user.tag}.`, label: 'Discord' });
			logger.info({ message: `Running version ${version}. For help, see https://github.com/ZapSquared/Warden/issues.`, label: 'Warden' });
			if (version.includes('-')) {
				logger.warn({ message: 'You are running an unstable version of Warden. Please report bugs using the link above, and note that features may change or be removed entirely prior to release.', label: 'Warden' });
			}
			client.tts.connect(client.user.id);
			updateStartup();
		}
		else {
			logger.info({ message: 'Reconnected.', label: 'Discord' });
			logger.warn({ message: 'Attempting to resume sessions.', label: 'Warden' });
			for (const pair of client.tts.players) {
				const player = pair[1];
				await player.resume();
			}
		}
		client.user.setActivity(`users | ${version}`, { type: 'WATCHING' });
	},
};
