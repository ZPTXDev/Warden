export default {
	DISCONNECT: {
		INACTIVITY: {
			DISCONNECTED: 'Disconnected due to inactivity.'
		},
		ALONE: {
			DISCONNECTED: {
				DEFAULT: 'Disconnected as everyone left.',
				MOVED: 'Disconnected as there was no one in the target channel.'
			}
		},
		CHANNEL_UNSUPPORTED: 'Disconnected as the target channel type is not supported.'
	},
	SESSION_ENDED: {
		FORCED: {
			DISCONNECTED: 'Session ended as I was disconnected.'
		}
	},
	PLAYER: {
		RESTARTING: {
			DEFAULT: 'Warden is restarting and will disconnect.',
			CRASHED: 'Warden has crashed and will disconnect.',
			APOLOGY: 'Sorry for the inconvenience caused.'
		},
		PLAYING: {
			NOTHING: 'There is nothing playing right now.'
		}
	}
}
