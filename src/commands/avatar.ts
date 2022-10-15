import type { WardenInteraction } from '#src/lib/util/common.d.js';
import { settings } from '#src/lib/util/settings.js';
import { getGuildLocaleString, getLocaleString } from '#src/lib/util/util.js';
import type {
    ChatInputCommandInteraction,
    SlashCommandBooleanOption,
    SlashCommandStringOption,
    SlashCommandUserOption,
} from 'discord.js';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import type { AvatarFormats } from './avatar.d.js';

export default {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription(
            getLocaleString(
                settings.defaultLocaleCode,
                'CMD.AVATAR.DESCRIPTION',
            ),
        )
        .addUserOption(
            (option): SlashCommandUserOption =>
                option
                    .setName('user')
                    .setDescription(
                        getLocaleString(
                            settings.defaultLocaleCode,
                            'CMD.AVATAR.OPTION.USER',
                        ),
                    ),
        )
        .addStringOption(
            (option): SlashCommandStringOption =>
                option
                    .setName('type')
                    .setDescription(
                        getLocaleString(
                            settings.defaultLocaleCode,
                            'CMD.AVATAR.OPTION.TYPE.DESCRIPTION',
                        ),
                    )
                    .setChoices(
                        {
                            name: getLocaleString(
                                settings.defaultLocaleCode,
                                'CMD.AVATAR.OPTION.TYPE.OPTION.USER',
                            ),
                            value: 'user',
                        },
                        {
                            name: getLocaleString(
                                settings.defaultLocaleCode,
                                'CMD.AVATAR.OPTION.TYPE.OPTION.GUILD',
                            ),
                            value: 'guild',
                        },
                    ),
        )
        .addBooleanOption(
            (option): SlashCommandBooleanOption =>
                option
                    .setName('formats')
                    .setDescription(
                        getLocaleString(
                            settings.defaultLocaleCode,
                            'CMD.AVATAR.OPTION.FORMATS',
                        ),
                    ),
        ),
    checks: [],
    permissions: {
        user: [],
        bot: [],
    },
    async execute(
        interaction: WardenInteraction<ChatInputCommandInteraction>,
    ): Promise<void> {
        const user = interaction.options.getUser('user') ?? interaction.user;
        const type = interaction.options.getString('type') ?? 'user';
        const formats = interaction.options.getBoolean('formats');
        const member = interaction.guild?.members.cache.get(user.id);
        const reference = type === 'user' ? user : member;
        if (type === 'guild' && !member?.avatar) {
            await interaction.replyHandler.locale(
                'CMD.AVATAR.RESPONSE.NO_GUILD_AVATAR',
                { type: 'error' },
            );
            return;
        }
        async function getFormatComponents(): Promise<ButtonBuilder[]> {
            if (!formats) {
                return [
                    new ButtonBuilder()
                        .setLabel(
                            await getGuildLocaleString(
                                interaction.guildId,
                                'CMD.AVATAR.MISC.EXTERNAL_LINK',
                            ),
                        )
                        .setStyle(ButtonStyle.Link)
                        .setURL(reference.displayAvatarURL({ size: 2048 })),
                ];
            }
            const avatarFormats: AvatarFormats[] = [
                'gif',
                'png',
                'jpg',
                'webp',
            ];
            const enabledAvatarFormats: AvatarFormats[] = ['png'];
            if (reference.avatar?.startsWith('a_'))
                enabledAvatarFormats.push('gif');
            if (reference.avatar) enabledAvatarFormats.push('jpg', 'webp');
            return avatarFormats.map(
                (format): ButtonBuilder =>
                    new ButtonBuilder()
                        .setLabel(format.toUpperCase())
                        .setStyle(ButtonStyle.Link)
                        .setURL(
                            reference.displayAvatarURL({
                                size: 2048,
                                extension: format,
                            }),
                        )
                        .setDisabled(!enabledAvatarFormats.includes(format)),
            );
        }
        await interaction.replyHandler.reply(
            new EmbedBuilder()
                .setTitle(
                    await getGuildLocaleString(
                        interaction.guildId,
                        type === 'user'
                            ? 'CMD.AVATAR.MISC.USER'
                            : 'CMD.AVATAR.MISC.GUILD',
                    ),
                )
                .setDescription(user.tag)
                .setImage(reference.displayAvatarURL({ size: 2048 })),
            {
                components: [
                    new ActionRowBuilder<ButtonBuilder>().setComponents(
                        await getFormatComponents(),
                    ),
                ],
            },
        );
    },
};
