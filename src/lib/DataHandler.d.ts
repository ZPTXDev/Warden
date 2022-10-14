export type DatabaseObject = {
    settings?: GuildSettingsObject;
};

export type GuildSettingsObject = {
    tts?: TTSSettingObject;
    locale?: string;
};

export type TTSSettingObject = {
	prepend: 'username' | 'nickname' | 'none';
};
