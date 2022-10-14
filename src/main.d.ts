import type { ClientEvents } from 'discord.js';
import type { NodeEvents } from 'lavaclient';

export type WardenEvent = {
    name: keyof ClientEvents
    once: boolean;
    execute<K extends keyof ClientEvents>(...args: ClientEvents[K]): void | Promise<void>;
};

export type WardenTTSEvent = {
    name: keyof NodeEvents;
    once: boolean;
    execute<K extends NodeEvents>(...args: NodeEvents[K]): void | Promise<void>;
}
