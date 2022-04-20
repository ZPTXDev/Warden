const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { defaultColor, defaultLocale } = require('../settings.json');
const { getLocale } = require('../functions.js');
const { guildData } = require('../shared.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription(getLocale(defaultLocale, 'CMD_AVATAR_DESCRIPTION'))
		.addUserOption(option =>
			option
				.setName('user')
				.setDescription(getLocale(defaultLocale, 'CMD_AVATAR_OPTION_USER')))
		.addBooleanOption(option =>
			option
				.setName('options')
				.setDescription(getLocale(defaultLocale, 'CMD_AVATAR_OPTION_FORMAT'))),
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
			await interaction.replyHandler.localeError('CMD_AVATAR_NO_AVATAR', {}, user.id);
			return;
		}
		const author = {
			name: user.tag,
		};
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
					.setTitle(getLocale(guildData.get(`${interaction.guildId}.locale`) ?? defaultLocale, 'CMD_AVATAR_SERVER'))
					.setDescription(options ? `${getLocale(guildData.get(`${interaction.guildId}.locale`) ?? defaultLocale, 'CMD_AVATAR_FORMATS')}\n${ganimated ? `[gif](${guser.avatarURL({ dynamic: true, size: 2048 })}) | ` : ''}[png](${guser.avatarURL({ format: 'png', size: 2048 })}) | [jpg](${guser.avatarURL({ format: 'jpg', size: 2048 })}) | [webp](${guser.avatarURL({ format: 'webp', size: 2048 })})\n${getLocale(guildData.get(`${interaction.guildId}.locale`) ?? defaultLocale, 'CMD_AVATAR_SIZES')}\n${gsizes}` : `[${getLocale(guildData.get(`${interaction.guildId}.locale`) ?? defaultLocale, 'CMD_AVATAR_EXTERNAL_LINK')}](${guser.avatarURL({ dynamic: true, format: 'png' })})`)
					.setAuthor(author)
					.setImage(guser.avatarURL({ dynamic: true, format: 'png', size: 2048 }))
					.setColor(defaultColor),
			];
		}
		await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setTitle(getLocale(defaultLocale, 'CMD_AVATAR_USER'))
					.setDescription(options ? `${getLocale(guildData.get(`${interaction.guildId}.locale`) ?? defaultLocale, 'CMD_AVATAR_FORMATS')}\n${animated ? `[gif](${user.avatarURL({ dynamic: true, size: 2048 })}) | ` : ''}[png](${user.avatarURL({ format: 'png', size: 2048 })}) | [jpg](${user.avatarURL({ format: 'jpg', size: 2048 })}) | [webp](${user.avatarURL({ format: 'webp', size: 2048 })})\n${getLocale(guildData.get(`${interaction.guildId}.locale`) ?? defaultLocale, 'CMD_AVATAR_SIZES')}\n${sizes}` : `[${getLocale(guildData.get(`${interaction.guildId}.locale`) ?? defaultLocale, 'CMD_AVATAR_EXTERNAL_LINK')}](${user.avatarURL({ dynamic: true, format: 'png' })})`)
					.setAuthor(author)
					.setImage(user.displayAvatarURL({ dynamic: true, format: 'png', size: 2048 }))
					.setColor(defaultColor),
				...guildAvatar,
			],
		});
	},
};
