import type { WardenClient, WardenPlayer } from '#src/lib/util/common.d.js';
import { logger } from '#src/lib/util/common.js';
import type { VoiceState } from 'discord.js';
import { ChannelType, PermissionsBitField } from 'discord.js';

export default {
    name: 'voiceStateUpdate',
    once: false,
    async execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
        const guild = oldState.guild;
        const client = oldState.client as WardenClient;
        const player = client.tts.players.get(guild.id) as WardenPlayer;
        if (!player) return;
        // Warden voiceStateUpdate
        if (oldState.member.user.id === oldState.client.user.id) {
            // Warden didn't leave the channel, but their voice state changed
            if (
                (oldState.serverMute !== newState.serverMute ||
                    oldState.serverDeaf !== newState.serverDeaf) &&
                oldState.channelId === newState.channelId
            ) {
                return;
            }
            /** Checks for when Warden leaves */
            // Disconnected
            if (!newState.channelId) {
                logger.info({
                    message: `[G ${player.guildId}] Cleaning up`,
                    label: 'Warden',
                });
                player.channelId = null;
                await player.handler.locale(
                    'MUSIC.SESSION_ENDED.FORCED.DISCONNECTED',
                    { type: 'warning' },
                );
                return player.handler.disconnect();
            }
            /** Checks for when Warden joins or moves */
            // Channel is a voice channel
            if (newState.channel.type === ChannelType.GuildVoice) {
                // Check for connect, speak permission for voice channel
                const permissions = oldState.client.guilds.cache
                    .get(guild.id)
                    .channels.cache.get(newState.channelId)
                    .permissionsFor(oldState.client.user.id);
                if (
                    !permissions.has(
                        new PermissionsBitField([
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.Connect,
                            PermissionsBitField.Flags.Speak,
                        ]),
                    )
                ) {
                    await player.handler.locale(
                        'DISCORD.INSUFFICIENT_PERMISSIONS.BOT.BASIC',
                        { type: 'error' },
                    );
                    return player.handler.disconnect();
                }
            }
            if (newState.channel.type === ChannelType.GuildStageVoice) {
                await player.handler.locale(
                    'TTS.DISCONNECT.CHANNEL_UNSUPPORTED',
                    { type: 'error' },
                );
                return player.handler.disconnect();
            }
            // Moved to a new channel that has no humans
            if (
                newState.channel.members.filter((m): boolean => !m.user.bot)
                    .size < 1
            ) {
                logger.info({
                    message: `[G ${player.guildId}] Disconnecting (alone)`,
                    label: 'Warden',
                });
                await player.handler.locale(
                    'TTS.DISCONNECT.ALONE.DISCONNECTED.MOVED',
                    { type: 'warning' },
                );
                return player.handler.disconnect();
            }
        }
        // Other bots' voice state changed
        if (oldState.member.user.bot) return;
        // User voiceStateUpdate
        // User not in Warden's channel
        if (oldState.channelId !== player?.channelId) return;
        // User didn't leave the channel, but their voice state changed
        if (newState.channelId === oldState.channelId) return;
        /** Checks for when a user leaves */
        // Channel still has humans
        if (
            oldState.channel.members.filter((m): boolean => !m.user.bot).size >=
            1
        ) {
            return;
        }
        logger.info({
            message: `[G ${player.guildId}] Disconnecting (alone)`,
            label: 'Warden',
        });
        await player.handler.locale(
            'TTS.DISCONNECT.ALONE.DISCONNECTED.DEFAULT',
            { type: 'warning' },
        );
        return player.handler.disconnect();
    },
};
