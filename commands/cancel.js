const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { checks } = require('../enums.js');
const { defaultColor, defaultLocale } = require('../settings.json');
const { getLocale } = require('../functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cancel')
		.setDescription(getLocale(defaultLocale, 'CMD_CANCEL_DESCRIPTION')),
	checks: [checks.GUILD_ONLY, checks.ACTIVE_SESSION, checks.IN_VOICE, checks.IN_SESSION_VOICE],
	permissions: {
		user: [],
		bot: [],
	},
	async execute(interaction) {
		const player = interaction.client.music.players.get(interaction.guildId);
		if (!player?.connected || !player?.playing) {
			await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setDescription(getLocale(defaultLocale, 'CMD_CANCEL_NOT_PLAYING'))
						.setColor('DARK_RED'),
				],
				ephemeral: true,
			});
			return;
		}
		player.queue.clear();
		await player.queue.skip();
		await player.queue.start();
		await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setDescription(getLocale(defaultLocale, 'CMD_CANCEL_SUCCESS'))
					.setColor(defaultColor),
			],
		});
	},
};
