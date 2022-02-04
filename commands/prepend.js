const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { checks } = require('../enums.js');
const { defaultColor, defaultLocale } = require('../settings.json');
const { getLocale } = require('../functions.js');
const { guildData } = require('../data.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prepend')
		.setDescription(getLocale(defaultLocale, 'CMD_PREPEND_DESCRIPTION'))
		.addStringOption(option =>
			option
				.setName('type')
				.setDescription(getLocale(defaultLocale, 'CMD_PREPEND_OPTION_TYPE'))
				.setRequired(true)
				.addChoice(getLocale(defaultLocale, 'CMD_PREPEND_OPTION_TYPE_USERNAME'), 'username')
				.addChoice(getLocale(defaultLocale, 'CMD_PREPEND_OPTION_TYPE_NICKNAME'), 'nickname')
				.addChoice(getLocale(defaultLocale, 'CMD_PREPEND_OPTION_TYPE_NONE'), 'none')),
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
						.setDescription(getLocale(guildData.get(`${interaction.guildId}.locale`) ?? defaultLocale, 'CMD_PREPEND_DISABLED'))
						.setColor(defaultColor),
				],
			});
			return;
		}
		guildData.set(`${interaction.guildId}.tts.prepend`, type);
		await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setDescription(getLocale(guildData.get(`${interaction.guildId}.locale`) ?? defaultLocale, 'CMD_PREPEND_ENABLED', type))
					.setColor(defaultColor),
			],
		});
	},
};
