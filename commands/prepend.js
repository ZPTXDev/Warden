const { SlashCommandBuilder } = require('@discordjs/builders');
const { checks } = require('../enums.js');
const { defaultLocale } = require('../settings.json');
const { getLocale } = require('../functions.js');
const { guildData } = require('../shared.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prepend')
		.setDescription(getLocale(defaultLocale, 'CMD_PREPEND_DESCRIPTION'))
		.addStringOption(option =>
			option
				.setName('type')
				.setDescription(getLocale(defaultLocale, 'CMD_PREPEND_OPTION_TYPE'))
				.setRequired(true)
				.addChoices(
					{ name: 'CMD_PREPEND_OPTION_TYPE_USERNAME', value: 'username' },
					{ name: 'CMD_PREPEND_OPTION_TYPE_NICKNAME', value: 'nickname' },
					{ name: 'CMD_PREPEND_OPTION_TYPE_NONE', value: 'none' },
				)),
	checks: [checks.GUILD_ONLY, checks.IN_VOICE, checks.IN_SESSION_VOICE],
	permissions: {
		user: ['MANAGE_GUILD'],
		bot: [],
	},
	async execute(interaction) {
		const type = interaction.options.getString('type');
		if (type === 'none') {
			guildData.del(`${interaction.guildId}.tts.prepend`);
			await interaction.replyHandler.locale('CMD_PREPEND_DISABLED');
			return;
		}
		guildData.set(`${interaction.guildId}.tts.prepend`, type);
		await interaction.replyHandler.locale('CMD_PREPEND_ENABLED', {}, type);
	},
};
