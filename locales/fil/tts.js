export default {
	DISCONNECT: {
		INACTIVITY: { DISCONNECTED: 'Nadiskonekta mula sa kawalan ng aktibidad.' },
		ALONE: {
			DISCONNECTED: {
				DEFAULT: 'Nadiskonekta nang umalis ang lahat.',
				MOVED: 'Nadiskonekta dahil walang tao sa target na channel.'
			}
		},
		CHANNEL_UNSUPPORTED: 'Nadiskonekta dahil hindi sinusuportahan ang type ng target channel.'
	},
	SESSION_ENDED: { FORCED: { DISCONNECTED: 'Natapos ang session dahil nadiskonekta ako.' } },
	PLAYER: {
		RESTARTING: {
			DEFAULT: 'Nagre-restart si Warden at madidiskonekta.',
			CRASHED: 'Si Warden ay nagcrash at madidiskonekta.',
			APOLOGY: 'Paumanhin para sa abalang naidulot.'
		},
		PLAYING: { NOTHING: 'Walang nang nagpatugtog ngayon.' }
	}
};