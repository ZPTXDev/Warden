const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { checks } = require('../enums.js');
const { defaultColor } = require('../settings.json');
const { guildData } = require('../data.js');
const googleTTS = require('google-tts-api');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription('Say something in your voice channel through text-to-speech.')
		.addStringOption(option =>
			option
				.setName('message')
				.setDescription('The message to say.')
				.setRequired(true)),
	checks: [checks.GUILD_ONLY, checks.IN_VOICE, checks.IN_SESSION_VOICE],
	permissions: {
		user: [],
		bot: ['CONNECT', 'SPEAK'],
	},
	async execute(interaction) {
		await interaction.deferReply();
		const prepend = guildData.get(`${interaction.guildId}.tts.prepend`);
		const rawMessage = interaction.options.getString('message');
		const message = `${prepend ? `${prepend === 'nickname' ? interaction.member.nickname ?? interaction.user.username : interaction.user.username} says ` : ''}${rawMessage}`;
		const tracks = [];
		let errored = false;
		const urls = googleTTS.getAllAudioUrls(message);
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
						.setDescription('There was an error loading your message. Try again later.')
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
		}
		if (player.playing) {
			await interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setDescription('I am in the middle of another message.')
						.setColor('DARK_RED'),
				],
			});
			return;
		}

		player.queue.add(tracks, { requester: interaction.user.id });

		await interaction.editReply({
			embeds: [
				new MessageEmbed()
					.setDescription(rawMessage)
					.setAuthor(interaction.user.tag, interaction.user.avatarURL({ format: 'png', dynamic: true }))
					.setColor(defaultColor),
			],
		});
		await player.queue.start();
	},
};