# Warden
Warden is a simple-to-use moderation and utility bot with features such as auto-moderation, text-to-speech, and more.

# Using Warden
Warden utilizes slash commands, buttons, and menus. After deploying the commands, type `/` into your chat to list Warden's commands.

# Public Instance
Warden is available for public use [here](https://go.zptx.dev/InviteWarden). Keep in mind that this instance of Warden will only run the latest stable version.

# Hosting Warden
Hosting Warden is fairly simple. Make a copy of `settings.example.json`, edit the fields as necessary and rename it to `settings.json`. An explanation on each property is available [here](CONFIGURATION.md).

You are required to host your own instance of [Lavalink](https://github.com/freyacodes/Lavalink) and specify the connection details in `settings.json`.

## Prerequisites
- Node.js v16.9.0 (or higher)
- npm (should come bundled with Node.js)
- Lavalink (latest release)
- Bot token from [Discord](https://discord.com/developers/applications)

## Starting Warden for the first time
Run `npm ci` to install packages required to run Warden.

Run `npm run build` to compile the source code. Alternatively, you can run `npm run build-start` to compile the source code and start Warden in one command.

You can deploy slash commands after the build by running `npm run slash-deploy`.

For subsequent startups, you can simply run `npm start`, which skips the compilation step.

# FAQ
## Can you add x feature to Warden?
Yes, if it is meaningful. Submit an issue [here](https://github.com/ZPTXDev/Warden/issues) and I'll be happy to take a look.

## I changed the language through the `/settings` command. Why isn't it updating in slash commands?
Slash commands are defined when running `npm run slash-deploy`.

This means that slash command descriptions will follow the language set in `settings.json` (`defaultLocaleCode` 
key).

## I changed `defaultLocaleCode`, but it isn't updating in slash command descriptions. Why?
You need to re-deploy the commands using `npm run slash-deploy` for the new locale to take effect.

Due to Discord's limitations and the localizations we have, we don't currently use Discord's localized command name & description functionality. This may be worked on in the future.

# Translating
Take a look at our [Crowdin project](https://translate.zptx.dev).

# Contributing
Refer to [CONTRIBUTING.md](CONTRIBUTING.md).
