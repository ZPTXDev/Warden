import type {
    MessageOptionsBuilderInputs,
    MessageOptionsBuilderOptions,
    WardenClient,
    WardenPlayer,
} from '#src/lib/util/common.d.js';
import { logger } from '#src/lib/util/common.js';
import {
    buildMessageOptions,
    getGuildLocaleString,
} from '#src/lib/util/util.js';
import type { Message } from 'discord.js';
import { PermissionsBitField } from 'discord.js';

/** Class for handling Lavaclient's Player. */
export default class PlayerHandler {
    client: WardenClient;
    player: WardenPlayer;

    /**
     * Create an instance of PlayerHandler.
     * @param client - The discord.js Client.
     * @param player - The Lavaclient Player.
     */
    constructor(client: WardenClient, player: WardenPlayer) {
        this.client = client;
        this.player = player;
    }

    /**
     * Disconnects and cleans up the player.
     */
    async disconnect(): Promise<void> {
        clearTimeout(this.player.timeout);
        this.player.disconnect();
        await this.client.tts.destroyPlayer(this.player.guildId);
    }

    /**
     * Sends a message to the bound text channel.
     * @param inputData - The data to be used. Can be a string, EmbedBuilder, or an array of either.
     * @param options - Extra data, such as type or components, or files.
     * @returns The message that was sent.
     */
    async send(
        inputData: MessageOptionsBuilderInputs,
        {
            type = 'neutral',
            components = null,
            files = null,
        }: MessageOptionsBuilderOptions = {},
    ): Promise<Message | undefined> {
        const sendMsgOpts = buildMessageOptions(inputData, {
            type,
            components,
            files,
        });
        const channel = this.player.queue.channel;
        if (
            !channel
                ?.permissionsFor(this.client.user.id)
                ?.has(
                    new PermissionsBitField([
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                    ]),
                )
        ) {
            return undefined;
        }
        if (
            this.client.guilds.cache
                .get(this.player.guildId)
                .members.me.isCommunicationDisabled()
        ) {
            return undefined;
        }
        try {
            return await channel.send(sendMsgOpts);
        } catch (error) {
            if (error instanceof Error) {
                logger.error({
                    message: `${error.message}\n${error.stack}`,
                    label: 'Warden',
                });
            }
            return undefined;
        }
    }

    /**
     * Sends a localized message to the bound text channel.
     * @param stringPath - The code of the locale string to be used.
     * @param options - Extra data, such as type or components.
     * @returns The message that was sent.
     */
    async locale(
        stringPath: string,
        {
            vars = [],
            type = 'neutral',
            components = null,
            files = null,
        }: MessageOptionsBuilderOptions & { vars?: string[] } = {},
    ): Promise<Message | undefined> {
        const guildLocaleString = await getGuildLocaleString(
            this.player.guildId,
            stringPath,
            ...vars,
        );
        return this.send(guildLocaleString, { type, components, files });
    }
}
