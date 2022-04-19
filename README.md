# Warden
Warden is a simple-to-use moderation and utility bot with features such as auto-moderation, text-to-speech, and more.

# Using Warden
Warden utilizes slash commands, buttons, and menus. After deploying the commands, type `/` into your chat to list Warden's commands.

# Hosting Warden
Hosting Warden is fairly simple. Make a copy of `settings.example.json`, edit the fields as necessary and rename it to `settings.json`.

You are required to host your own instance of [Lavalink](https://github.com/freyacodes/Lavalink) and specify the connection details in `settings.json`.

For a detailed explanation on configuration, view [CONFIGURATION.md](CONFIGURATION.md).

## Prerequisites
- Node.js v16.9.0 (or higher)
- npm (should come bundled with Node.js)
- Lavalink (latest release)
- Bot token from [Discord](https://discord.com/developers/applications)

## Starting Warden for the first time
Run `npm ci` to install packages required to run Warden.

Then, run `node deploy-commands.js` **after** you've configured your `settings.json` in order to register your commands on Discord.

Once that's done, run `node main.js` to start the bot. This will be the only command you execute whenever you want to start Warden from now on.

# FAQ
## Can you add x feature to Warden?
Yes, if it is meaningful. Submit an issue [here](https://github.com/ZapSquared/Warden/issues) and I'll be happy to take a look.

## I changed the locale through `/locale`. Why isn't it updating in slash commands?
Slash commands are defined when running `node deploy-commands.js`.

This means that slash command descriptions will follow the locale set in `settings.json` (`defaultLocale` 
key).

## I changed `defaultLocale`, but it isn't updating in slash command descriptions. Why?
You need to re-deploy the commands using `node deploy-commands.js` for the new locale to take effect.

Due to Discord's limitations and the localizations we have, we don't currently use Discord's localized command name & description functionality. This may be worked on in the future.

# Contributing
Feel free to create a PR. If it's a meaningful addition, I'll merge it.

# Translating
Take a look at our [Crowdin project](https://translate.zptx.icu).

# Contributing
Refer to [CONTRIBUTING.md](CONTRIBUTING.md).
