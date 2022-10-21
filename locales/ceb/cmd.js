export default {
	AVATAR: {
		DESCRIPTION: 'Magpakita og avatar.',
		OPTION: {
			USER: 'Ang user sa pagpakita og usa ka avatar.',
			TYPE: {
				DESCRIPTION: 'Ang type sa avatar nga ipakita.',
				OPTION: {
					USER: 'User',
					GUILD: 'Server'
				}
			},
			FORMATS: 'Ipakita ang tanan nga mga kalainan sa format ug size alang sa avatar.'
		},
		RESPONSE: { NO_GUILD_AVATAR: 'Walay server avatar nga nakit-an.' },
		MISC: {
			GUILD: 'Server Avatar',
			USER: 'User Avatar',
			EXTERNAL_LINK: 'External Link'
		}
	},
	CANCEL: {
		DESCRIPTION: 'Ikansela ang kasamtangan nga text-to-speech nga message.',
		RESPONSE: {
			SUCCESS: 'Gikansel ang message.',
			NOT_PLAYING: 'Wala ko karon sa tunga sa usa ka message.'
		}
	},
	DISCONNECT: {
		DESCRIPTION: 'Ipadiskonek si Warden.',
		RESPONSE: { SUCCESS: 'Niguwas sa voice channel.' }
	},
	INFO: {
		DESCRIPTION: 'Ipakita ang impormasyon bahin ni Warden.',
		RESPONSE: { SUCCESS: 'Open source nga moderasyon ug utilidad nga bot para sa ginagmay na mga komunidad.\nNagdagan sa bersyong `%1`.' },
		MISC: {
			SOURCE_CODE: 'Source Code',
			INVITE: 'I-imbitar',
			SPONSOR_US: 'Sponsor Namo'
		}
	},
	PING: {
		DESCRIPTION: 'Susiha ang latency ug uptime ni Warden.',
		RESPONSE: { SUCCESS: 'Pong!%1' },
		MISC: { UPTIME: 'Uptime:' }
	},
	SAY: {
		DESCRIPTION: 'Pagsulti og usa ka butang sa imong voice channel pinaagi sa text-to-speech.',
		OPTION: { MESSAGE: 'Ang message nga isulti.' },
		RESPONSE: {
			IN_PROGRESS: 'Naa pako sa tunga sa lain nga message.',
			LOAD_FAIL: 'Adunay usa ka error sa pag-load sa imong message. Sulayi pag-usab unya.'
		}
	},
	SETTINGS: {
		DESCRIPTION: 'Usba ang mga setting ni Warden sa dinhi nga server.',
		RESPONSE: { HEADER: 'Mga setting sa **%1**' },
		MISC: {
			LANGUAGE: {
				NAME: 'Lengguwahe',
				DESCRIPTION: 'Ang lengguwahe nga gamiton alang niini nga server.'
			},
			PREPEND: {
				NAME: 'Prepend',
				DESCRIPTION: 'Unsa ang i-prepend sa text-to-speech nga mga message.',
				EXAMPLE_DESCRIPTION: 'Si Warden moingon:',
				EXAMPLE: {
					NONE: 'Kini kay usa ka text-to-speech nga message.',
					ENABLED: '%1 nag-ingon nga Kini usa ka text-to-speech nga message.'
				},
				OPTIONS: {
					NONE: 'None',
					USERNAME: 'Username',
					NICKNAME: 'Nickname'
				}
			}
		}
	}
};