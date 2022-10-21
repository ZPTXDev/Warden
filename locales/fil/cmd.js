export default {
	AVATAR: {
		DESCRIPTION: 'Magpakita ng isang avatar.',
		OPTION: {
			USER: 'Ang user para magpakita ng avatar.',
			TYPE: {
				DESCRIPTION: 'Ang type ng avatar na ipapakita.',
				OPTION: {
					USER: 'User',
					GUILD: 'Server'
				}
			},
			FORMATS: 'Ipakita ang lahat ng mga variation ng format at size para sa avatar.'
		},
		RESPONSE: { NO_GUILD_AVATAR: 'Walang server avatar na nakita.' },
		MISC: {
			GUILD: 'Server Avatar',
			USER: 'User Avatar',
			EXTERNAL_LINK: 'External Link'
		}
	},
	CANCEL: {
		DESCRIPTION: 'Kanselahin ang kasalukuyang text-to-speech na message.',
		RESPONSE: {
			SUCCESS: 'Nakansela ang message.',
			NOT_PLAYING: 'Kasalukuyan akong wala sa gitna ng isang message.'
		}
	},
	DISCONNECT: {
		DESCRIPTION: 'Idiskonekta si Warden.',
		RESPONSE: { SUCCESS: 'Umalis sa voice channel.' }
	},
	INFO: {
		DESCRIPTION: 'Magpakita ng impormasyon tungkol kay Warden.',
		RESPONSE: { SUCCESS: 'Open-source moderasyon at utilidad na bot para sa maliliit na komunidad.\nTumatakbo sa bersyong `%1`.' },
		MISC: {
			SOURCE_CODE: 'Source Code',
			INVITE: 'Mag-anyaya',
			SPONSOR_US: 'Sponsor sa Amin'
		}
	},
	PING: {
		DESCRIPTION: 'Suriin ang latency at uptime ni Warden.',
		RESPONSE: { SUCCESS: 'Pong!%1' },
		MISC: { UPTIME: 'Uptime:' }
	},
	SAY: {
		DESCRIPTION: 'Magsabi ng isang bagay sa iyong voice channel sa pamamagitan ng text-to-speech.',
		OPTION: { MESSAGE: 'Ang message na sasabihin.' },
		RESPONSE: {
			IN_PROGRESS: 'Nasa gitna ako ng isa pang message.',
			LOAD_FAIL: 'Nagkaroon ng error sa paglo-load ng iyong message. Subukan ulit mamaya.'
		}
	},
	SETTINGS: {
		DESCRIPTION: 'Baguhin ang mga setting ni Warden sa server na ito.',
		RESPONSE: { HEADER: 'Mga setting sa **%1**' },
		MISC: {
			LANGUAGE: {
				NAME: 'Wika',
				DESCRIPTION: 'Ang wikang gagamitin sa server na ito.'
			},
			PREPEND: {
				NAME: 'Prepend',
				DESCRIPTION: 'Ano ang dapat i-prepend sa text-to-speech na mga message.',
				EXAMPLE_DESCRIPTION: 'Sasabihin ni Warden:',
				EXAMPLE: {
					NONE: 'Ito ay isang text-to-speech na message.',
					ENABLED: 'Sabi ni %1 na Ito ay isang text-to-speech na message.'
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