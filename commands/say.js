const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const { checks } = require('../enums.js');
const { defaultColor, defaultLocale } = require('../settings.json');
const { getLocale } = require('../functions.js');
const { guildData } = require('../data.js');
const googleTTS = require('google-tts-api');

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
		const permissions = interaction.member.voice.channel.permissionsFor(interaction.client.user.id);
		if (!permissions.has(['VIEW_CHANNEL', 'CONNECT', 'SPEAK'])) {
			await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setDescription(getLocale(guildData.get(`${interaction.guildId}.locale`) ?? defaultLocale, 'DISCORD_BOT_MISSING_PERMISSIONS_BASIC'))
						.setColor('DARK_RED'),
				],
				ephemeral: true,
			});
			return;
		}
		if (interaction.member.voice.channel.type === 'GUILD_STAGE_VOICE' && !permissions.has(Permissions.STAGE_MODERATOR)) {
			await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setDescription(getLocale(guildData.get(`${interaction.guildId}.locale`) ?? defaultLocale, 'DISCORD_BOT_MISSING_PERMISSIONS_STAGE'))
						.setColor('DARK_RED'),
				],
				ephemeral: true,
			});
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
			await interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setDescription(getLocale(guildData.get(`${interaction.guildId}.locale`) ?? defaultLocale, 'CMD_SAY_LOAD_FAIL'))
						.setColor('DARK_RED'),
				],
			});
			return;
		}
		let player = interaction.client.music.players.get(interaction.guildId);
		if (!player?.connected) {
			player = interaction.client.music.createPlayer(interaction.guildId);
			player.queue.channel = interaction.channel;
			await player.connect(interaction.member.voice.channelId, { deafened: true });
			// that kid left while we were busy bruh
			if (!interaction.member.voice.channelId) {
				player.disconnect();
				interaction.client.music.destroyPlayer(interaction.guildId);
				await interaction.editReply({
					embeds: [
						new MessageEmbed()
							.setDescription(getLocale(guildData.get(`${interaction.guildId}.locale`) ?? defaultLocale, 'DISCORD_INTERACTION_CANCELED', interaction.user.id))
							.setColor(defaultColor),
					],
				});
				return;
			}
			if (interaction.member.voice.channel.type === 'GUILD_STAGE_VOICE' && !interaction.member.voice.channel.stageInstance) {
				await interaction.member.voice.channel.createStageInstance({ topic: getLocale(guildData.get(`${interaction.guildId}.locale`) ?? defaultLocale, 'TTS_STAGE_TOPIC'), privacyLevel: 'GUILD_ONLY' });
			}
		}
		if (player.playing) {
			await interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setDescription(getLocale(guildData.get(`${interaction.guildId}.locale`) ?? defaultLocale, 'CMD_SAY_IN_PROGRESS'))
						.setColor('DARK_RED'),
				],
			});
			return;
		}
		player.queue.add(tracks, { requester: interaction.user.id });

		const started = player.playing || player.paused;
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
		if (!started) { await player.queue.start(); }
		const state = interaction.guild.members.cache.get(interaction.client.user.id).voice;
		if (state.channel.type === 'GUILD_STAGE_VOICE' && state.suppress) {
			await state.setSuppressed(false);
		}
	},
};
