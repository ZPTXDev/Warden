# Warden
In line with [Quaver](https://go.zptx.icu/Quaver), Warden will be shifting its focus to smaller communities.

As such, data will be stored using JSON and no MySQL databases are required.

# Using Warden
Warden only allows slash commands for now. It will support components such as buttons in the near future.

# Hosting Warden
Hosting Warden is fairly simple. Make a copy of `settings.example.json`, edit the fields as necessary and rename it to `settings.json`.

You are required to host your own instance of [Lavalink](https://github.com/freyacodes/Lavalink) and specify the connection details in `settings.json`. This is mandatory for text-to-speech to work.

From version **2.0.0**, you are no longer required to specify MySQL connection details as Warden will use JSON for guild data.

## Prerequisites
- Node.js v16.0.0 (or higher)
- npm (should come with Node.js)
- Lavalink (latest release)
- Bot token from [Discord](https://discord.com/developers/applications)

## Starting Warden for the first time
In a Terminal, Command Prompt, Shell or however you access `node`, run `npm i` to install packages required to run Warden.

Then, run `node deploy-commands.js` **after** you've configured your `settings.json` in order to register your commands on Discord.

Once that's done, run `node main.js` to start the bot. This will be the only command you execute whenever you want to start Warden from now on.

# FAQ
## Where did all the moderation features go? Isn't this a moderation bot as well?
It'll be back soon. Text-to-speech is the current priority.

## Can you add x feature to Warden?
Yes, if it is meaningful. Submit an issue [here](https://github.com/ZapSquared/Warden/issues) and I'll take a look.

# Contributing
Feel free to create a PR. If it's a meaningful addition, I'll merge it.