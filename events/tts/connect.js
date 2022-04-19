const { logger } = require('../../shared.js');

module.exports = {
	name: 'connect',
	once: false,
	execute() {
		logger.info({ message: 'Connected.', label: 'Lavalink' });
	},
};
