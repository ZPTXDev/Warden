export default {
	AVATAR: {
		DESCRIPTION: 'Display an avatar.',
		OPTION: {
			USER: 'The user to display an avatar for.',
			TYPE: {
				DESCRIPTION: 'The type of avatar to display.',
				OPTION: {
					USER: 'User',
					GUILD: 'Server'
				}
			},
			FORMATS: 'Show all format variations for the avatar.'
		},
		RESPONSE: {
			NO_GUILD_AVATAR: 'No server avatar was found.'
		},
		MISC: {
			GUILD: 'Server Avatar',
			USER: 'User Avatar',
			EXTERNAL_LINK: 'External Link'
		}
	},
	CANCEL: {
		DESCRIPTION: 'Cancel the current text-to-speech message.',
		RESPONSE: {
			SUCCESS: 'Cancelled the message.',
			NOT_PLAYING: 'I am not currently in the middle of a message.'
		}
	},
	DISCONNECT: {
		DESCRIPTION: 'Disconnect Warden.',
		RESPONSE: {
			SUCCESS: 'Left the voice channel.'
		}
	},
	INFO: {
		DESCRIPTION: 'Show information about Quaver.',
		RESPONSE: {
			SUCCESS: 'Open-source music bot for small communities.\nRunning version `%1`.'
		},
		MISC: {
			SOURCE_CODE: 'Source Code',
			INVITE: 'Invite',
			SPONSOR_US: 'Sponsor Us'
		}
	},
	PING: {
		DESCRIPTION: 'Check Warden\'s latency and uptime.',
		RESPONSE: {
			SUCCESS: 'Pong!%1'
		},
		MISC: {
			UPTIME: 'Uptime:'
		}
	},
	SAY: {
		DESCRIPTION: 'Say something in your voice channel through text-to-speech.',
		OPTION: {
			MESSAGE: 'The message to say.'
		},
		RESPONSE: {
			IN_PROGRESS: 'I am in the middle of another message.',
			LOAD_FAIL: 'There was an error loading your message. Try again later.'
		}
	},
	SETTINGS: {
		DESCRIPTION: 'Change Warden\'s settings in this server.',
		RESPONSE: {
			HEADER: 'Settings for **%1**'
		},
		MISC: {
			LANGUAGE: {
				NAME: 'Language',
				DESCRIPTION: 'The language to use for this server.'
			},
			PREPEND: {
				NAME: 'Prepend',
				DESCRIPTION: 'What to prepend before text-to-speech messages.',
				EXAMPLE_DESCRIPTION: 'Warden will say:',
				EXAMPLE: {
					NONE: 'This is a text-to-speech message.',
					ENABLED: '%1 says This is a text-to-speech message.'
				},
				OPTIONS: {
					NONE: 'None',
					USERNAME: 'Username',
					NICKNAME: 'Nickname'
				}
			}
		}
	},
}
