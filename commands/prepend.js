const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { checks } = require('../enums.js');
const { defaultColor } = require('../settings.json');
const { guildData } = require('../data.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prepend')
		.setDescription('Configure text-to-speech to prepend a username or nickname.')
		.addStringOption(option =>
			option
				.setName('type')
				.setDescription('The type to prepend.')
				.setRequired(true)
				.addChoice('Username', 'username')
				.addChoice('Nickname', 'nickname')
				.addChoice('None', 'none')),
	checks: [checks.GUILD_ONLY, checks.IN_VOICE, checks.IN_SESSION_VOICE],
	permissions: {
		user: ['MANAGE_GUILD'],
		bot: [],
	},
	async execute(interaction) {
		const type = interaction.options.getString('type');
		if (type === 'none') {
			guildData.del(`${interaction.guildId}.tts.prepend`);
			await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setDescription('Prepending disabled.')
						.setColor(defaultColor),
				],
				ephemeral: true,
			});
			return;
		}
		guildData.set(`${interaction.guildId}.tts.prepend`, type);
		await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setDescription(`Text-to-speech will now prepend the user's **${type}** in messages.`)
					.setColor(defaultColor),
			],
			ephemeral: true,
		});
	},
};