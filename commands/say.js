const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { checks } = require('../enums.js');
const { defaultColor, defaultLocale } = require('../settings.json');
const { getLocale } = require('../functions.js');
const { guildData } = require('../shared.js');
const googleTTS = require('google-tts-api');
const TTSHandler = require('../classes/TTSHandler.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription(getLocale(defaultLocale, 'CMD_SAY_DESCRIPTION'))
		.addStringOption(option =>
			option
				.setName('message')
				.setDescription(getLocale(defaultLocale, 'CMD_SAY_OPTION_MESSAGE'))
				.setRequired(true)),
	checks: [checks.GUILD_ONLY, checks.IN_VOICE, checks.IN_SESSION_VOICE],
	permissions: {
		user: [],
		bot: [],
	},
	async execute(interaction) {
		// check for connect, speak permission for channel
		if (!interaction.member.voice.channel.permissionsFor(interaction.client.user.id).has(['CONNECT', 'SPEAK'])) {
			await interaction.replyHandler.localeError('DISCORD_BOT_MISSING_PERMISSIONS_BASIC');
			return;
		}

		await interaction.deferReply();
		const prepend = guildData.get(`${interaction.guildId}.tts.prepend`);
		const rawMessage = interaction.options.getString('message');
		const message = `${prepend ? `${prepend === 'nickname' ? interaction.member.nickname ?? interaction.user.username : interaction.user.username} says ` : ''}${rawMessage}`;
		const tracks = [];
		let errored = false;
		let urls = [];
		try {
			urls = googleTTS.getAllAudioUrls(message);
		}
		catch (error) {
			errored = true;
			console.error(error);
		}
		for (const url of urls) {
			const result = await interaction.client.music.rest.loadTracks(url.url);
			if (result.loadType === 'TRACK_LOADED') {
				tracks.push(result.tracks[0]);
			}
			else {
				errored = true;
				break;
			}
		}
		if (errored) {
			await interaction.replyHandler.localeError('CMD_SAY_LOAD_FAIL');
			return;
		}
		let player = interaction.client.music.players.get(interaction.guildId);
		if (!player?.connected) {
			player = interaction.client.music.createPlayer(interaction.guildId);
			player.ttsHandler = new TTSHandler(interaction.client, player);
			player.queue.channel = interaction.channel;
			await player.connect(interaction.member.voice.channelId, { deafened: true });
		}
		if (player.playing) {
			await interaction.replyHandler.localeError('CMD_SAY_IN_PROGRESS');
			return;
		}
		player.queue.add(tracks, { requester: interaction.user.id });
		await interaction.editReply({
			embeds: [
				new MessageEmbed()
					.setDescription(rawMessage)
					.setAuthor({
						name: interaction.user.tag,
						iconURL: interaction.user.avatarURL({ format: 'png', dynamic: true }),
					})
					.setColor(defaultColor),
			],
		});
		await player.queue.start();
	},
};
