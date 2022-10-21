import type PlayerHandler from '#src/lib/PlayerHandler.js';
import type ReplyHandler from '#src/lib/ReplyHandler.js';
import type { Queue } from '@lavaclient/queue';
import type {
    ActionRowBuilder,
    AttachmentBuilder,
    AutocompleteInteraction,
    Client,
    Collection,
    EmbedBuilder,
    MessageActionRowComponentBuilder,
    TextChannel,
    VoiceChannel,
} from 'discord.js';
import type { Node, Player } from 'lavaclient';

export type SettingsPageOptions = 'language' | 'prepend';

export type SettingsPage = {
    current: string;
    embeds: EmbedBuilder[];
    actionRow: ActionRowBuilder;
};

export type MessageOptionsBuilderInputs =
    | string
    | EmbedBuilder
    | (string | EmbedBuilder)[];

export type MessageOptionsBuilderOptions = {
    type?: 'success' | 'neutral' | 'warning' | 'error';
    components?: ActionRowBuilder<MessageActionRowComponentBuilder>[];
    files?: AttachmentBuilder[];
};

export type JSONResponse<T> = { message?: string } & T;

export type WardenChannels = TextChannel | VoiceChannel;

export type WardenClient = Client<boolean> & {
    tts?: Node;
    commands?: Collection<string, ChatInputCommand>;
    buttons?: Collection<string, Button>;
    selectmenus?: Collection<string, SelectMenu>;
    autocomplete?: Collection<string, Autocomplete>;
    modals?: Collection<string, ModalSubmit>;
};

export type WardenPlayer = Player<Node> & {
    timeout?: ReturnType<typeof setTimeout>;
    queue?: WardenQueue;
    handler?: PlayerHandler;
};

export type WardenQueue = Queue & {
    channel?: WardenChannels;
    player: WardenPlayer;
};

export type WardenInteraction<T> = T extends AutocompleteInteraction
    ? AutocompleteInteraction & {
          client: WardenClient;
      }
    : T & {
          client: WardenClient;
          replyHandler: ReplyHandler;
      };
