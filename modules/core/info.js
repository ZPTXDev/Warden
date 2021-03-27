const {CommandOptionType} = require("slash-create");

module.exports.commands = ["info"];
module.exports.usage = "%cmd% [stats]";
module.exports.description = "Display information about Warden.";
module.exports.action = function (details) {
    const settings = require("../../main.js").settings;
    const managers = settings.get("managers");
    const build = require("../../main.js").build;
    const modules = require("../../main.js").modules;
    const bot = require("../../main.js").bot;
    const msToTime = require("../../main.js").msToTime;
    const msToTimeString = require("../../main.js").msToTimeString;
    const roundTo = require("../../main.js").roundTo;
    let type = "";
    if (details["body"] === "stats") {
        if (!managers.includes(details["message"].author.id)) {
            return "manager";
        }
        else {
            type = "stats";
        }
    }
    if (!["stats", ""].includes(details["body"])) {
        return "usage";
    }
    let userTotal = 0;
    bot.guilds.map(g => g.memberCount).forEach(a => userTotal += a);
    let channelTotal = 0;
    bot.guilds.map(g => g.channels.size).forEach(a => channelTotal += a);
    let uptime = msToTime(process.uptime() * 1000);
    let uptimeString = msToTimeString(uptime);
    let modulesLoaded = Object.keys(modules).length;
    let actionsLoaded = 0;
    Object.keys(modules).forEach(module => {
        actionsLoaded += Object.keys(modules[module]).length;
    });
    details["message"].channel.createMessage({
        messageReferenceID: details["message"].id,
        embed: {
            title: "Warden",
            description: `A moderation and utility bot, part of the ZapSquared Network.\nSource code available [here](https://github.com/zapteryx/Warden).\nRunning build [\`${build.slice(0, 7)}\`](https://github.com/zapteryx/Warden/commit/${build}).`,
            color: 0x2518a0,
            fields: type === "stats" ? [
                {
                    name: "Bot Statistics",
                    value: `**Servers**: ${bot.guilds.size}\n**Users**: ${userTotal} (${bot.users.size} cached)\n**Channels**: ${channelTotal}`
                },
                {
                    name: "Technical Statistics",
                    value: `**RAM Usage**: ${roundTo(process.memoryUsage().heapUsed / 1024 / 1024, 2).toString()} MB\n**Uptime**: ${uptimeString}\n**Modules Loaded**: ${modulesLoaded} (${actionsLoaded} actions)`
                },
                {
                    name: "Version",
                    value: `**Warden**: \`${build}\`\n**Eris**: \`${require("eris").VERSION}\`\n**NodeJS**: \`${process.env.NODE_VERSION}\``
                }
            ] : [],
            thumbnail: {
                url: bot.user.avatarURL
            }
        }
    });
    return true;
};

module.exports.slash = {
    name: "info",
    description: "Display information about Warden.",
    options: [
        {
            name: "stats",
            description: "Display additional statistics about Warden.",
            required: false,
            type: CommandOptionType.BOOLEAN
        }
    ]
};
module.exports.slashAction = async function(ctx) {
    const settings = require("../../main.js").settings;
    const managers = settings.get("managers");
    const build = require("../../main.js").build;
    const modules = require("../../main.js").modules;
    const bot = require("../../main.js").bot;
    const msToTime = require("../../main.js").msToTime;
    const msToTimeString = require("../../main.js").msToTimeString;
    const roundTo = require("../../main.js").roundTo;
    let type = "";
    if (ctx.options["stats"]) {
        if (!managers.includes(ctx.user.id)) {
            await ctx.send({
                embeds: [
                    {
                        description: "You need to be a **Manager** to use that.",
                        color: 0x2518a0
                    }
                ]
            });
            return;
        }
        else {
            type = "stats";
        }
    }
    let userTotal = 0;
    bot.guilds.map(g => g.memberCount).forEach(a => userTotal += a);
    let channelTotal = 0;
    bot.guilds.map(g => g.channels.size).forEach(a => channelTotal += a);
    let uptime = msToTime(process.uptime() * 1000);
    let uptimeString = msToTimeString(uptime);
    let modulesLoaded = Object.keys(modules).length;
    let actionsLoaded = 0;
    Object.keys(modules).forEach(module => {
        actionsLoaded += Object.keys(modules[module]).length;
    });
    await ctx.send({
        embeds: [
            {
                title: "Warden",
                description: `A moderation and utility bot, part of the ZapSquared Network.\nSource code available [here](https://github.com/zapteryx/Warden).\nRunning build [\`${build.slice(0, 7)}\`](https://github.com/zapteryx/Warden/commit/${build}).`,
                color: 0x2518a0,
                fields: type === "stats" ? [
                    {
                        name: "Bot Statistics",
                        value: `**Servers**: ${bot.guilds.size}\n**Users**: ${userTotal} (${bot.users.size} cached)\n**Channels**: ${channelTotal}`
                    },
                    {
                        name: "Technical Statistics",
                        value: `**RAM Usage**: ${roundTo(process.memoryUsage().heapUsed / 1024 / 1024, 2).toString()} MB\n**Uptime**: ${uptimeString}\n**Modules Loaded**: ${modulesLoaded} (${actionsLoaded} actions)`
                    },
                    {
                        name: "Version",
                        value: `**Warden**: \`${build}\`\n**Eris**: \`${require("eris").VERSION}\`\n**NodeJS**: \`${process.env.NODE_VERSION}\``
                    }
                ] : [],
                thumbnail: {
                    url: bot.user.avatarURL
                }
            }
        ]
    });
}