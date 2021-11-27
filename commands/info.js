const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const { version } = require('../package.json');
const { defaultColor } = require('../settings.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Show information about Warden.'),
	checks: [],
	permissions: {
		user: [],
		bot: [],
	},
	async execute(interaction) {
		await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setTitle('Warden')
					.setDescription(`Open-source moderation and utility bot for small communities.\nSource code available [here](https://go.zptx.icu/Warden), invite [here](${interaction.client.generateInvite({ permissions: [Permissions.FLAGS.ADMINISTRATOR], scopes: ['bot', 'applications.commands'] })}).\nRunning version \`${version}\`.`)
					.setColor(defaultColor)
					.setThumbnail(interaction.client.user.avatarURL({ format: 'png' })),
			],
		});
	},
};