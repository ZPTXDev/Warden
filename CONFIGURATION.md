# Configuration

```json
{
    "token": "Paste token here",
    "applicationId": "Paste application ID here",
    "colors": {
        "success": "DarkGreen",
        "neutral": "#2518a0",
        "warning": "Orange",
        "error": "DarkRed"
    },
    "defaultLocaleCode": "en",
    "disableAd": false,
    "managers": [
        "Paste your user ID here"
    ],
    "database": {
        "protocol": "sqlite",
        "path": "../database.sqlite"
    },
    "lavalink": {
        "host": "localhost",
        "port": 12345,
        "password": "youshallnotpass",
        "secure": false,
        "reconnect": {
            "delay": 3000,
            "tries": 5
        }
    }
}
```

`token` - Your bot token. You can get it from the [Discord Developer Portal](https://discord.com/developers/applications).

`applicationId` - Your application ID. Typically the same as your [bot's user ID](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-). You can get it from the [Discord Developer Portal](https://discord.com/developers/applications).

`clientSecret` - Your client secret. You can get it from the [Discord Developer Portal](https://discord.com/developers/applications) under `OAuth2 > General`.

`colors` - The colors used for embeds. Valid values are available [here](https://discord.js.org/#/docs/discord.js/main/typedef/ColorResolvable).

`defaultLocaleCode` - The default locale code. Valid values are available in the `locales` folder.
> **Note:** This is used for all logs, slash command descriptions (at the time of deployment), and for all guilds without a language specified.

`disableAd` - Whether to disable the ad in the `info` command (Sponsor Us button).
> **Note:** Please do not disable the ad unless you really need to. Sponsors help keep the development of ZPTXDev projects going. Consider sponsoring us if you need to disable the ad!

`managers` - The [user IDs](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-) that are given manager-level permissions on Warden.

`database.protocol` - The database protocol.

`database.path` - The database path. This is relative to the `dist` folder.

`lavalink.host` - The Lavalink instance host address.

`lavalink.port` - The Lavalink instance port.

`lavalink.password` - The Lavalink instance password.

`lavalink.secure` - Whether or not the Lavalink instance uses a secure connection.

`lavalink.reconnect.delay` - The delay in milliseconds between Lavalink reconnect attempts.

`lavalink.reconnect.tries` - The number of times to attempt to reconnect to Lavalink.
