import type {
    Button,
    ChatInputCommand,
    ModalSubmit,
    SelectMenu,
} from '#src/events/interactionCreate.d.js';
import type { WardenClient, WardenPlayer } from '#src/lib/util/common.d.js';
import { data, logger, setLocales } from '#src/lib/util/common.js';
import { settings } from '#src/lib/util/settings.js';
import {
    getAbsoluteFileURL,
    getGuildLocaleString,
    msToTime,
    msToTimeString,
} from '#src/lib/util/util.js';
import '@lavaclient/queue/register';
import {
    Client,
    Collection,
    EmbedBuilder,
    GatewayDispatchEvents,
    GatewayIntentBits,
} from 'discord.js';
import { readdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import type { NodeEvents } from 'lavaclient';
import { Node } from 'lavaclient';
import { createInterface } from 'readline';
import { inspect } from 'util';
import type { WardenEvent, WardenTTSEvent } from './main.d.js';

export const startup = { started: false };

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});
rl.on('line', async (input): Promise<void> => {
    switch (input.split(' ')[0].toLowerCase()) {
        case 'exit':
            await shuttingDown('exit');
            break;
        case 'sessions':
            if (!module.exports.startup) {
                console.log('Warden is not initialized yet.');
                break;
            }
            console.log(
                `There are currently ${bot.tts.players.size} active session(s).`,
            );
            break;
        case 'stats': {
            const uptime = msToTime(bot.uptime);
            const uptimeString = msToTimeString(uptime);
            console.log(
                `Statistics:\nGuilds: ${bot.guilds.cache.size}\nUptime: ${uptimeString}`,
            );
            break;
        }
        case 'eval': {
            if (!settings.developerMode) {
                console.log('Developer mode is not enabled.');
                break;
            }
            if (!input.substring(5)) {
                console.log('No input provided.');
                break;
            }
            let output: string;
            try {
                output = await eval(input.substring(5));
                if (typeof output !== 'string') output = inspect(output);
            } catch (error) {
                output = error;
            }
            if (!output) output = '[no output]';
            console.log(output);
            break;
        }
        default:
            console.log('Available commands: exit, sessions, stats');
            break;
    }
});
rl.on('close', async (): Promise<void> => shuttingDown('SIGINT'));

data.guild.instance.on('error', async (err: Error): Promise<void> => {
    logger.error({ message: 'Failed to connect to database.', label: 'Keyv' });
    await shuttingDown('keyv', err);
});

export const bot: WardenClient = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});
bot.commands = new Collection();
bot.tts = new Node({
    connection: {
        host: settings.lavalink.host,
        port: settings.lavalink.port,
        password: settings.lavalink.password,
        secure: !!settings.lavalink.secure,
        reconnect: {
            delay: settings.lavalink.reconnect.delay ?? 3000,
            tries: settings.lavalink.reconnect.tries ?? 5,
        },
    },
    sendGatewayPayload: (id, payload): void =>
        bot.guilds.cache.get(id)?.shard?.send(payload),
});
bot.ws.on(
    GatewayDispatchEvents.VoiceServerUpdate,
    async (payload): Promise<void> => bot.tts.handleVoiceUpdate(payload),
);
bot.ws.on(
    GatewayDispatchEvents.VoiceStateUpdate,
    async (payload): Promise<void> => bot.tts.handleVoiceUpdate(payload),
);

let inProgress = false;
/**
 * Shuts the bot down gracefully.
 * @param eventType - The event type triggering the shutdown. This determines if the shutdown was caused by a crash.
 * @param err - The error object, if any.
 */
export async function shuttingDown(
    eventType: string,
    err?: Error,
): Promise<void> {
    if (inProgress) return;
    inProgress = true;
    logger.info({
        message: `Shutting down${eventType ? ` due to ${eventType}` : ''}...`,
        label: 'Warden',
    });
    try {
        if (startup.started) {
            const players = bot.tts.players;
            if (players.size < 1) return;
            logger.info({
                message: 'Disconnecting from all guilds...',
                label: 'Warden',
            });
            for (const pair of players) {
                const player: WardenPlayer = pair[1];
                logger.info({
                    message: `[G ${player.guildId}] Disconnecting (restarting)`,
                    label: 'Warden',
                });
                await player.handler.disconnect();
                const success = await player.handler.send(
                    new EmbedBuilder()
                        .setDescription(
                            `${await getGuildLocaleString(
                                player.guildId,
                                [
                                    'exit',
                                    'SIGINT',
                                    'SIGTERM',
                                    'lavalink',
                                ].includes(eventType)
                                    ? 'TTS.PLAYER.RESTARTING.DEFAULT'
                                    : 'TTS.PLAYER.RESTARTING.CRASHED',
                            )}`,
                        )
                        .setFooter({
                            text: await getGuildLocaleString(
                                player.guildId,
                                'TTS.PLAYER.RESTARTING.APOLOGY',
                            ),
                        }),
                    { type: 'warning' },
                );
                if (!success) continue;
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            logger.error({
                message: 'Encountered error while shutting down.',
                label: 'Warden',
            });
            logger.error({
                message: `${error.message}\n${error.stack}`,
                label: 'Warden',
            });
        }
    } finally {
        if (
            !['exit', 'SIGINT', 'SIGTERM'].includes(eventType) &&
            err instanceof Error
        ) {
            logger.error({
                message: `${err.message}\n${err.stack}`,
                label: 'Warden',
            });
            logger.info({
                message: 'Logging additional output to error.log.',
                label: 'Warden',
            });
            try {
                await writeFile(
                    'error.log',
                    `${eventType}${err.message ? `\n${err.message}` : ''}${
                        err.stack ? `\n${err.stack}` : ''
                    }`,
                );
            } catch (e) {
                if (e instanceof Error) {
                    logger.error({
                        message:
                            'Encountered error while writing to error.log.',
                        label: 'Warden',
                    });
                    logger.error({
                        message: `${e.message}\n${e.stack}`,
                        label: 'Warden',
                    });
                }
            }
        }
        bot.destroy();
        process.exit();
    }
}

const locales = new Collection<string, unknown>();
const localeFolders = readdirSync(
    getAbsoluteFileURL(import.meta.url, ['..', 'locales']),
);
for await (const folder of localeFolders) {
    const localeFiles = readdirSync(
        getAbsoluteFileURL(import.meta.url, ['..', 'locales', folder]),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const localeProps: Record<string, any> = {};
    for await (const file of localeFiles) {
        const categoryProps = await import(
            getAbsoluteFileURL(import.meta.url, [
                '..',
                'locales',
                folder,
                file,
            ]).toString()
        );
        const categoryName = file.split('.')[0].toUpperCase();
        localeProps[categoryName] = categoryProps.default;
    }
    locales.set(folder, localeProps);
}
setLocales(locales);

const commandFiles = readdirSync(
    getAbsoluteFileURL(import.meta.url, ['commands']),
).filter((file): boolean => file.endsWith('.js') || file.endsWith('.ts'));
for (const file of commandFiles) {
    const command: { default: ChatInputCommand } = await import(
        getAbsoluteFileURL(import.meta.url, ['commands', file]).toString()
    );
    bot.commands.set(command.default.data.name, command.default);
}

const componentsFolders = readdirSync(
    getAbsoluteFileURL(import.meta.url, ['components']),
);
for await (const folder of componentsFolders) {
    const componentFiles = readdirSync(
        getAbsoluteFileURL(import.meta.url, ['components', folder]),
    ).filter((file): boolean => file.endsWith('.js') || file.endsWith('.ts'));
    for await (const file of componentFiles) {
        const component: { default: Button | SelectMenu | ModalSubmit } =
            await import(
                getAbsoluteFileURL(import.meta.url, [
                    'components',
                    folder,
                    file,
                ]).toString()
            );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!(bot as Record<string, any>)[folder]) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (bot as Record<string, any>)[folder] = new Collection();
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (bot as Record<string, any>)[folder].set(
            component.default.name,
            component.default,
        );
    }
}

const eventFiles = readdirSync(
    getAbsoluteFileURL(import.meta.url, ['events']),
).filter((file): boolean => file.endsWith('.js') || file.endsWith('.ts'));
for await (const file of eventFiles) {
    const event: { default: WardenEvent } = await import(
        getAbsoluteFileURL(import.meta.url, ['events', file]).toString()
    );
    if (event.default.once) {
        bot.once(event.default.name, (...args): void | Promise<void> =>
            event.default.execute(...args),
        );
    } else {
        bot.on(event.default.name, (...args): void | Promise<void> =>
            event.default.execute(...args),
        );
    }
}

const ttsEventFiles = readdirSync(
    getAbsoluteFileURL(import.meta.url, ['events', 'tts']),
).filter((file): boolean => file.endsWith('.js') || file.endsWith('.ts'));
for await (const file of ttsEventFiles) {
    const event: { default: WardenTTSEvent } = await import(
        getAbsoluteFileURL(import.meta.url, ['events', 'tts', file]).toString()
    );
    if (event.default.once) {
        bot.tts.once(
            event.default.name as keyof NodeEvents,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (...args: any[]): void | Promise<void> =>
                event.default.execute(...args),
        );
    } else {
        bot.tts.on(
            event.default.name as keyof NodeEvents,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (...args: any[]): void | Promise<void> =>
                event.default.execute(...args),
        );
    }
}
bot.login(settings.token);

[
    'exit',
    'SIGINT',
    'SIGUSR1',
    'SIGUSR2',
    'SIGTERM',
    'uncaughtException',
    'unhandledRejection',
].forEach((eventType): void => {
    process.on(
        eventType,
        async (err): Promise<void> => shuttingDown(eventType, err),
    );
});
