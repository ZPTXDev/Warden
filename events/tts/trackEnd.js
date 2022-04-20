const { logger, guildData } = require('../../shared.js');
const { bot } = require('../../main.js');

module.exports = {
	name: 'trackEnd',
	once: false,
	async execute(queue) {
		if (bot.guilds.cache.get(queue.player.guildId).channels.cache.get(queue.player.channelId).members?.filter(m => !m.user.bot).size < 1 && !guildData.get(`${queue.player.guildId}.always.enabled`)) {
			logger.info({ message: `[G ${queue.player.guildId}] Disconnecting (alone)`, label: 'Warden' });
			queue.player.ttsHandler.locale('TTS_ALONE');
			await queue.player.ttsHandler.disconnect();
			return;
		}
	},
};
