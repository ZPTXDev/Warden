const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { checks } = require('../enums.js');
const { defaultColor, defaultLocale } = require('../settings.json');
const { getLocale } = require('../functions.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('disconnect')
		.setDescription('Disconnect Warden.'),
	checks: [checks.GUILD_ONLY, checks.IN_VOICE, checks.IN_SESSION_VOICE],
	permissions: {
		user: [],
		bot: [],
	},
	async execute(interaction) {
		const player = interaction.client.music.players.get(interaction.guildId);
		if (!player?.connected) {
			await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setDescription(getLocale(defaultLocale, 'CHECK_ACTIVE_SESSION'))
						.setColor('DARK_RED'),
				],
				ephemeral: true,
			});
			return;
		}
		clearTimeout(player.timeout);
		player.disconnect();
		interaction.client.music.destroyPlayer(interaction.guildId);
		await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setDescription(getLocale(defaultLocale, 'CMD_DISCONNECT_SUCCESS'))
					.setColor(defaultColor),
			],
		});
	},
};
