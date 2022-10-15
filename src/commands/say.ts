import PlayerHandler from '#src/lib/PlayerHandler.js';
import type { WardenChannels, WardenInteraction, WardenPlayer } from '#src/lib/util/common.d.js';
import { data, logger } from '#src/lib/util/common.js';
import { checks } from '#src/lib/util/constants.js';
import { settings } from '#src/lib/util/settings.js';
import { getLocaleString } from '#src/lib/util/util.js';
import type { ChatInputCommandInteraction, SlashCommandStringOption } from 'discord.js';
import { ChannelType, EmbedBuilder, GuildMember, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { getAllAudioUrls } from 'google-tts-api';

export default {
	data: new SlashCommandBuilder()
		.setName('say')
		.setDescription(getLocaleString(settings.defaultLocaleCode, 'CMD.SAY.DESCRIPTION'))
		.addStringOption((option): SlashCommandStringOption =>
			option
				.setName('message')
				.setDescription(getLocaleString(settings.defaultLocaleCode, 'CMD.SAY.OPTION.MESSAGE'))
				.setRequired(true)),
	checks: [checks.GUILD_ONLY, checks.IN_VOICE, checks.IN_SESSION_VOICE],
	permissions: {
		user: [],
		bot: [],
	},
	async execute(interaction: WardenInteraction<ChatInputCommandInteraction>): Promise<void> {
		if (![ChannelType.GuildText, ChannelType.GuildVoice].includes(interaction.channel.type)) {
			await interaction.replyHandler.locale('DISCORD.CHANNEL_UNSUPPORTED', { type: 'error' });
			return;
		}

		// check for connect, speak permission for channel
		if (!(interaction.member instanceof GuildMember)) return;
		const permissions = interaction.member.voice.channel.permissionsFor(interaction.client.user.id);
		if (!permissions.has(new PermissionsBitField([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak]))) {
			await interaction.replyHandler.locale('DISCORD.INSUFFICIENT_PERMISSIONS.BOT.BASIC', { type: 'error' });
			return;
		}
		if (interaction.member.voice.channel.type === ChannelType.GuildStageVoice) {
			await interaction.replyHandler.locale('DISCORD.CHANNEL_UNSUPPORTED', { type: 'error' });
			return;
		}
		let me = await interaction.guild.members.fetchMe();
		if (me.isCommunicationDisabled()) {
			await interaction.replyHandler.locale('DISCORD.INSUFFICIENT_PERMISSIONS.BOT.TIMED_OUT', { type: 'error' });
			return;
		}
		let player = interaction.client.tts.players.get(interaction.guildId) as WardenPlayer;
		if (player?.playing) {
			await interaction.replyHandler.locale('CMD.SAY.RESPONSE.IN_PROGRESS', { type: 'error' });
			return;
		}
		await interaction.deferReply();
		let prepend = await data.guild.get(interaction.guildId, 'settings.prepend');
		switch (prepend) {
			case 'username':
				prepend = `${interaction.user.username} says `;
				break;
			case 'nickname':
				prepend = `${interaction.member.nickname ?? interaction.user.username} says `;
				break;
			case 'none':
			default:
				prepend = '';
				break;
		}
		const rawMessage = interaction.options.getString('message');
		const message = `${prepend}${rawMessage}`;
		const tracks = [];
		let errored = false;
		let urls: ReturnType<typeof getAllAudioUrls> = [];
		try {
			urls = getAllAudioUrls(message);
		}
		catch (error) {
			errored = true;
			logger.error({ message: error, label: 'Warden' });
		}
		for (const url of urls) {
			const result = await interaction.client.tts.rest.loadTracks(url.url);
			if (result.loadType === 'TRACK_LOADED') {
				tracks.push(result.tracks[0]);
			}
			else {
				errored = true;
				break;
			}
		}
		if (errored) {
			await interaction.replyHandler.locale('CMD.SAY.RESPONSE.LOAD_FAIL', { type: 'error' });
			return;
		}
		if (!player?.connected) {
			player = interaction.client.tts.createPlayer(interaction.guildId) as WardenPlayer;
			player.handler = new PlayerHandler(interaction.client, player);
			player.queue.channel = interaction.channel as WardenChannels;
			await player.connect(interaction.member.voice.channelId, { deafened: true });
			me = await interaction.guild?.members.fetchMe();
			const timedOut = me.isCommunicationDisabled();
			if (!interaction.member.voice.channelId || timedOut || !interaction.guild) {
				if (interaction.guild) timedOut ? await interaction.replyHandler.locale('DISCORD.INSUFFICIENT_PERMISSIONS.BOT.TIMED_OUT', { type: 'error' }) : await interaction.replyHandler.locale('DISCORD.INTERACTION.CANCELED', { vars: [interaction.user.id] });
				return player.handler.disconnect();
			}
		}
		player.queue.add(tracks, { requester: interaction.user.id });
		await interaction.replyHandler.reply(
			new EmbedBuilder()
				.setDescription(rawMessage)
				.setAuthor({
					name: interaction.user.tag,
					iconURL: interaction.member.displayAvatarURL(),
				}),
		);
		await player.queue.start();
	},
};
