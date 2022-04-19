require('@lavaclient/queue/register');
const { Client, Intents, Collection } = require('discord.js');
const { Node } = require('lavaclient');
const { token, lavalink, defaultLocale } = require('./settings.json');
const fs = require('fs');
const fsPromises = require('fs').promises;
const { msToTime, msToTimeString, getLocale } = require('./functions.js');
const readline = require('readline');
const { logger, guildData } = require('./shared.js');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});
rl.on('line', line => {
	switch (line.split(' ')[0].toLowerCase()) {
		case 'exit':
			shuttingDown('exit');
			break;
		case 'sessions':
			if (!module.exports.startup) {
				console.log('Warden is not initialized yet.');
				break;
			}
			console.log(`There are currently ${bot.music.players.size} active session(s).`);
			break;
		case 'stats': {
			const uptime = msToTime(bot.uptime);
			const uptimeString = msToTimeString(uptime);
			console.log(`Statistics:\nGuilds: ${bot.guilds.cache.size}\nUptime: ${uptimeString}`);
			break;
		}
		default:
			console.log('Available commands: exit, sessions, stats');
			break;
	}
});
rl.on('close', () => shuttingDown('SIGINT'));

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
bot.commands = new Collection();
bot.music = new Node({
	connection: {
		host: lavalink.host,
		port: lavalink.port,
		password: lavalink.password,
		secure: !!lavalink.secure,
		reconnect: {
			delay: lavalink.reconnect.delay ?? 3000,
			tries: lavalink.reconnect.tries ?? 5,
		},
	},
	sendGatewayPayload: (id, payload) => bot.guilds.cache.get(id)?.shard?.send(payload),
});
bot.ws.on('VOICE_SERVER_UPDATE', data => bot.music.handleVoiceUpdate(data));
bot.ws.on('VOICE_STATE_UPDATE', data => bot.music.handleVoiceUpdate(data));
module.exports.bot = bot;

let inProgress = false;
async function shuttingDown(eventType, err) {
	if (inProgress) return;
	inProgress = true;
	logger.info({ message: 'Shutting down...', label: 'Warden' });
	if (module.exports.startup) {
		logger.info({ message: 'Disconnecting from all guilds...', label: 'Warden' });
		for (const pair of bot.music.players) {
			const player = pair[1];
			logger.info({ message: `[G ${player.guildId}] Disconnecting (restarting)`, label: 'Warden' });
			await player.ttsHandler.locale(['exit', 'SIGINT'].includes(eventType) ? 'TTS_RESTART' : 'TTS_RESTART_CRASH', { footer: getLocale(guildData.get(`${player.guildId}.locale`) ?? defaultLocale, 'TTS_RESTART_SORRY') });
			await player.ttsHandler.disconnect();
			const botChannelPerms = bot.guilds.cache.get(player.guildId).channels.cache.get(player.queue.channel.id).permissionsFor(bot.user.id);
			if (!botChannelPerms.has(['VIEW_CHANNEL', 'SEND_MESSAGES'])) { continue; }
			await player.ttsHandler.locale(['exit', 'SIGINT', 'SIGTERM', 'lavalink'].includes(eventType) ? 'TTS_RESTART' : 'TTS_RESTART_CRASH', { footer: getLocale(guildData.get(`${player.guildId}.locale`) ?? defaultLocale, 'TTS_RESTART_SORRY') });
		}
	}
	if (err) {
		logger.error({ message: `${err.message}\n${err.stack}`, label: 'Warden' });
		logger.info({ message: 'Logging additional output to error.log.', label: 'Warden' });
		try {
			await fsPromises.writeFile('error.log', `${eventType}${err.message ? `\n${err.message}` : ''}${err.stack ? `\n${err.stack}` : ''}`);
		}
		catch (e) {
			logger.error({ message: 'Encountered error while writing to error.log.', label: 'Warden' });
			logger.error({ message: `${e.message}\n${e.stack}`, label: 'Warden' });
		}
	}
	bot.destroy();
	process.exit();
}
module.exports.shuttingDown = shuttingDown;

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	bot.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		bot.once(event.name, (...args) => event.execute(...args));
	}
	else {
		bot.on(event.name, (...args) => event.execute(...args));
	}
}

const ttsEventFiles = fs.readdirSync('./events/tts').filter(file => file.endsWith('.js'));
for (const file of ttsEventFiles) {
	const event = require(`./events/tts/${file}`);
	if (event.once) {
		bot.music.once(event.name, (...args) => event.execute(...args));
	}
	else {
		bot.music.on(event.name, (...args) => event.execute(...args));
	}
}

bot.login(token);

['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM', 'uncaughtException', 'unhandledRejection'].forEach(eventType => {
	process.on(eventType, err => shuttingDown(eventType, err));
});

module.exports.startup = false;
module.exports.updateStartup = () => {
	module.exports.startup = true;
};

