const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { defaultColor } = require('../settings.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Display an avatar.')
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription('The user to display an avatar for.'))
		.addBooleanOption(option =>
			option
				.setName('options')
				.setDescription('Show all format and size variations for the avatar.')),
	checks: [],
	permissions: {
		user: [],
		bot: [],
	},
	async execute(interaction) {
		const user = interaction.options.getUser('user') ?? interaction.user;
		const options = !!interaction.options.getBoolean('options');
		const animated = user.avatar?.startsWith('a_');
		if (!user.avatar && options) {
			await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setDescription(`<@${user.id}> does not have an avatar and options cannot be provided.`)
						.setColor(defaultColor),
				],
				ephemeral: true,
			});
			return;
		}
		let sizes = [];
		let start = 4096;
		while (start >= 16) {
			sizes.push(`[${start.toString()}](${user.displayAvatarURL({ dynamic: true, format: 'png', size: start })})`);
			start /= 2;
		}
		sizes = sizes.join(' | ');
		let guildAvatar = [];
		const guser = interaction.guild?.members.cache.get(user.id);
		if (guser?.avatar) {
			const ganimated = guser.avatar.startsWith('a_');
			let gsizes = [];
			start = 4096;
			while (start >= 16) {
				gsizes.push(`[${start.toString()}](${guser.avatarURL({ dynamic: true, format: 'png', size: start })})`);
				start /= 2;
			}
			gsizes = gsizes.join(' | ');
			guildAvatar = [
				new MessageEmbed()
					.setTitle('Server Avatar')
					.setDescription(options ? `**Formats**:\n${ganimated ? `[gif](${guser.avatarURL({ dynamic: true, size: 2048 })}) | ` : ''}[png](${guser.avatarURL({ format: 'png', size: 2048 })}) | [jpg](${guser.avatarURL({ format: 'jpg', size: 2048 })}) | [webp](${guser.avatarURL({ format: 'webp', size: 2048 })})\n**Sizes**:\n${gsizes}` : `[External Link](${guser.avatarURL({ dynamic: true, format: 'png' })})`)
					.setAuthor(user.tag)
					.setImage(guser.avatarURL({ dynamic: true, format: 'png', size: 2048 }))
					.setColor(defaultColor),
			];
		}
		await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setTitle('User Avatar')
					.setDescription(options ? `**Formats**:\n${animated ? `[gif](${user.avatarURL({ dynamic: true, size: 2048 })}) | ` : ''}[png](${user.avatarURL({ format: 'png', size: 2048 })}) | [jpg](${user.avatarURL({ format: 'jpg', size: 2048 })}) | [webp](${user.avatarURL({ format: 'webp', size: 2048 })})\n**Sizes**:\n${sizes}` : `[External Link](${user.avatarURL({ dynamic: true, format: 'png' })})`)
					.setAuthor(user.tag)
					.setImage(user.displayAvatarURL({ dynamic: true, format: 'png', size: 2048 }))
					.setColor(defaultColor),
				...guildAvatar,
			],
		});
	},
};