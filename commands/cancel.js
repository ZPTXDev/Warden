const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { checks } = require('../enums.js');
const { defaultColor } = require('../settings.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('cancel')
		.setDescription('Cancel the current text-to-speech message.'),
	checks: [checks.GUILD_ONLY, checks.IN_VOICE, checks.IN_SESSION_VOICE],
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
						.setDescription('I am not currently in the middle of a message.')
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
					.setDescription('Cancelled the message.')
					.setColor(defaultColor),
			],
			ephemeral: true,
		});
	},
};