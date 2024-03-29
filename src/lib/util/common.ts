import DataHandler from '#src/lib/DataHandler.js';
import { settings } from '#src/lib/util/settings.js';
import type { Snowflake } from 'discord.js';
import { Collection } from 'discord.js';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createLogger, format, transports } from 'winston';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const data = {
    guild: new DataHandler({
        cache: settings.database
            ? `${settings.database.protocol}://${resolve(
                  __dirname,
                  '..',
                  '..',
                  settings.database.path,
              )}`
            : `sqlite://${resolve(__dirname, '..', '..', 'database.sqlite')}`,
        namespace: 'guild',
    }),
};
export const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.errors({ stack: true }),
        format.timestamp(),
        format.printf(
            (info): string =>
                `${info.timestamp} [${
                    info.label
                }] ${info.level.toUpperCase()}: ${info.message}`,
        ),
    ),
    transports: [
        new transports.Console({
            format: format.combine(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                format((info): any => {
                    info.level = info.level.toUpperCase();
                    return info;
                })(),
                format.errors({ stack: true }),
                format.timestamp(),
                format.colorize(),
                format.printf(
                    (info): string =>
                        `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`,
                ),
            ),
        }),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/log.log' }),
    ],
});
export let locales = new Collection();
export function setLocales(newLocales: Collection<string, unknown>): void {
    locales = newLocales;
}
export const confirmationTimeout: Record<
    Snowflake,
    ReturnType<typeof setTimeout>
> = {};
