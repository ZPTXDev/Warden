require('@lavaclient/queue/register');
const { Client, Intents, Collection, MessageEmbed } = require('discord.js');
const { Node } = require('lavaclient');
const { token, lavalink, defaultColor, defaultLocale } = require('./settings.json');
const fs = require('fs');
const fsPromises = require('fs').promises;
const { version } = require('./package.json');
const { checks } = require('./enums.js');
const { getLocale } = require('./functions.js');
const readline = require('readline');
const { guildData } = require('./data.js');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});
rl.on('line', line => {
	if (line === 'exit') {
		process.exit(0);
	}
});

const bot = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES] });
bot.commands = new Collection();
bot.music = new Node({
	connection: {
		host: lavalink.host,
		port: lavalink.port,
		password: lavalink.password,
		secure: !!lavalink.secure,
	},
	sendGatewayPayload: (id, payload) => bot.guilds.cache.get(id)?.shard?.send(payload),
});
bot.ws.on('VOICE_SERVER_UPDATE', data => bot.music.handleVoiceUpdate(data));
bot.ws.on('VOICE_STATE_UPDATE', data => bot.music.handleVoiceUpdate(data));

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	bot.commands.set(command.data.name, command);
}
let startup = false;

bot.music.on('connect', () => {
	console.log(`[Warden] ${getLocale(defaultLocale, 'LOG_LAVALINK_CONNECTED')}`);
});

bot.music.on('queueFinish', queue => {
	console.log(`[G ${queue.player.guildId}] ${getLocale(defaultLocale, 'LOG_SETTING_TIMEOUT')}`);
	if (queue.player.timeout) {
		clearTimeout(queue.player.timeout);
	}
	queue.player.timeout = setTimeout(p => {
		console.log(`[G ${p.guildId}] ${getLocale(defaultLocale, 'LOG_INACTIVITY')}`);
		const channel = p.queue.channel;
		p.disconnect();
		bot.music.destroyPlayer(p.guildId);
		channel.send({
			embeds: [
				new MessageEmbed()
					.setDescription(getLocale(guildData.get(`${p.guildId}.locale`) ?? defaultLocale, 'TTS_INACTIVITY'))
					.setColor(defaultColor),
			],
		});
	}, 300000, queue.player);
});

bot.music.on('trackStart', queue => {
	console.log(`[G ${queue.player.guildId}] ${getLocale(defaultLocale, 'LOG_STARTING_TRACK')}`);
	if (queue.player.timeout) {
		clearTimeout(queue.player.timeout);
		delete queue.player.timeout;
	}
});

bot.music.on('trackEnd', queue => {
	if (bot.guilds.cache.get(queue.player.guildId).channels.cache.get(queue.player.channelId).members?.filter(m => !m.user.bot).size < 1) {
		console.log(`[G ${queue.player.guildId}] ${getLocale(defaultLocale, 'LOG_ALONE')}`);
		queue.player.disconnect();
		bot.music.destroyPlayer(queue.player.guildId);
		queue.channel.send({
			embeds: [
				new MessageEmbed()
					.setDescription(getLocale(guildData.get(`${queue.player.guildId}.locale`) ?? defaultLocale, 'TTS_ALONE'))
					.setColor(defaultColor),
			],
		});
		return;
	}
});

bot.on('ready', async () => {
	if (!startup) {
		console.log(`[Warden] ${getLocale(defaultLocale, 'LOG_DISCORD_CONNECTED', bot.user.tag)}`);
		console.log(`[Warden] ${getLocale(defaultLocale, 'LOG_STARTUP', version)}`);
		bot.music.connect(bot.user.id);
		bot.user.setActivity(version);
		startup = true;
	}
	else {
		console.log(`[Warden] ${getLocale(defaultLocale, 'LOG_CONNECTION_LOST')}`);
		for (const pair of bot.music.players) {
			const player = pair[1];
			await player.resume();
		}
	}
});

bot.on('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
		const command = bot.commands.get(interaction.commandName);
		if (!command) return;
		console.log(`[${interaction.guildId ? `G ${interaction.guildId} | ` : ''}U ${interaction.user.id}] ${getLocale(defaultLocale, 'LOG_CMD_PROCESSING', interaction.commandName)}`);
		const failedChecks = [];
		for (const check of command.checks) {
			switch (check) {
				// Only allowed in guild
				case checks.GUILD_ONLY:
					if (!interaction.guildId) {
						failedChecks.push(check);
					}
					break;
				// Must have an active session
				case checks.ACTIVE_SESSION: {
					const player = bot.music.players.get(interaction.guildId);
					if (!player) {
						failedChecks.push(check);
					}
					break;
				}
				// Must be in a voice channel
				case checks.IN_VOICE:
					if (!interaction.member?.voice.channelId) {
						failedChecks.push(check);
					}
					break;
				// Must be in the same voice channel (will not fail if the bot is not in a voice channel)
				case checks.IN_SESSION_VOICE: {
					const player = bot.music.players.get(interaction.guildId);
					if (player && interaction.member?.voice.channelId !== player.channelId) {
						failedChecks.push(check);
					}
					break;
				}
			}
		}
		if (failedChecks.length > 0) {
			console.log(`[${interaction.guildId ? `G ${interaction.guildId} | ` : ''}U ${interaction.user.id}] ${getLocale(defaultLocale, 'LOG_CMD_FAILED', interaction.commandName, failedChecks.length)}`);
			await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setDescription(getLocale(guildData.get(`${interaction.guildId}.locale`) ?? defaultLocale, failedChecks[0]))
						.setColor('DARK_RED'),
				],
				ephemeral: true,
			});
			return;
		}
		const failedPermissions = { user: [], bot: [] };
		for (const perm of command.permissions.user) {
			if (!interaction.member.permissions.has(perm)) {
				failedPermissions.user.push(perm);
			}
		}
		for (const perm of command.permissions.bot) {
			if (!interaction.guild.members.cache.get(bot.user.id).permissions.has(perm)) {
				failedPermissions.user.push(perm);
			}
		}
		if (failedPermissions.user.length > 0) {
			await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setDescription(getLocale(guildData.get(`${interaction.guildId}.locale`) ?? defaultLocale, 'DISCORD_USER_MISSING_PERMISSIONS', failedPermissions.user.map(perm => '`' + perm + '`').join(' ')))
						.setColor('DARK_RED'),
				],
				ephemeral: true,
			});
			return;
		}
		if (failedPermissions.bot.length > 0) {
			await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setDescription(getLocale(guildData.get(`${interaction.guildId}.locale`) ?? defaultLocale, 'DISCORD_BOT_MISSING_PERMISSIONS', failedPermissions.bot.map(perm => '`' + perm + '`').join(' ')))
						.setColor('DARK_RED'),
				],
				ephemeral: true,
			});
			return;
		}
		try {
			console.log(`[${interaction.guildId ? `G ${interaction.guildId} | ` : ''}U ${interaction.user.id}] ${getLocale(defaultLocale, 'LOG_CMD_EXECUTING', interaction.commandName)}`);
			await command.execute(interaction);
		}
		catch (err) {
			console.log(`[${interaction.guildId ? `G ${interaction.guildId} | ` : ''}U ${interaction.user.id}] ${getLocale(defaultLocale, 'LOG_CMD_ERROR', interaction.commandName)}`);
			console.error(err);
			await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setDescription(getLocale(guildData.get(`${interaction.guildId}.locale`) ?? defaultLocale, 'DISCORD_CMD_ERROR'))
						.setColor('DARK_RED'),
				],
				ephemeral: true,
			});
		}
	}
});

bot.on('guildCreate', guild => {
	console.log(`[G ${guild.id}] ${getLocale(defaultLocale, 'LOG_GUILD_JOINED', guild.name)}`);
});

bot.on('guildDelete', guild => {
	console.log(`[G ${guild.id}] ${getLocale(defaultLocale, 'LOG_GUILD_LEFT', guild.name)}`);
});

bot.login(token);

let inprg = false;
async function shuttingDown(eventType, err) {
	if (inprg) return;
	inprg = true;
	console.log(`[Warden] ${getLocale(defaultLocale, 'LOG_SHUTDOWN')}`);
	if (startup) {
		console.log(`[Warden] ${getLocale(defaultLocale, 'LOG_DISCONNECTING')}`);
		for (const pair of bot.music.players) {
			const player = pair[1];
			console.log(`[G ${player.guildId}] ${getLocale(defaultLocale, 'LOG_RESTARTING')}`);
			await player.queue.channel.send({
				embeds: [
					new MessageEmbed()
						.setDescription(`${getLocale(guildData.get(`${player.guildId}.locale`) ?? defaultLocale, ['exit', 'SIGINT'].includes(eventType) ? 'TTS_RESTART' : 'TTS_RESTART_CRASH')}`)
						.setFooter({ text: getLocale(guildData.get(`${player.guildId}.locale`) ?? defaultLocale, 'TTS_RESTART_SORRY') })
						.setColor(defaultColor),
				],
			});
			player.disconnect();
			bot.music.destroyPlayer(player.guildId);
		}
	}
	if (!['exit', 'SIGINT', 'SIGTERM'].includes(eventType)) {
		console.log(`[Warden] ${getLocale(defaultLocale, 'LOG_ERROR')}`);
		try {
			await fsPromises.writeFile('error.log', `${eventType}${err.message ? `\n${err.message}` : ''}${err.stack ? `\n${err.stack}` : ''}`);
		}
		catch (e) {
			console.error(`[Warden] ${getLocale(defaultLocale, 'LOG_ERROR_FAIL')}\n${e}`);
		}
	}
	bot.destroy();
	process.exit();
}

['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM', 'uncaughtException', 'unhandledRejection'].forEach(eventType => {
	process.on(eventType, err => shuttingDown(eventType, err));
});
