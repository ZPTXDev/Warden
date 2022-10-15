import type { ColorResolvable, Snowflake } from 'discord.js';
import type { ConnectionInfo } from 'lavaclient';

export type SettingsObject = {
    token?: string;
    applicationId?: Snowflake;
    clientSecret?: string;
    colors?: ColorsSettingsObject;
    defaultLocaleCode?: string;
    disableAd?: boolean;
    managers?: Snowflake[];
    database?: DatabaseSettingsObject;
    lavalink?: ConnectionInfo;
};

export type ColorsSettingsObject = {
    success?: ColorResolvable;
    neutral?: ColorResolvable;
    warning?: ColorResolvable;
    error?: ColorResolvable;
};

export type DatabaseSettingsObject = {
    protocol?: string;
    path?: string;
};

export type LavalinkReconnectSettingsObject = {
    delay?: number;
    tries?: number;
};
