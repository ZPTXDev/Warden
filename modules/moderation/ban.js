const {CommandOptionType} = require("slash-create");

// testing
module.exports.commands = ["ban"];
module.exports.usage = "%cmd% @mention [@mention] [duration] [reason]";
module.exports.description = "Ban user(s).";
module.exports.action = async function (details) {
    const bot = require("../../main.js").bot;
    const getUserId = require("../../main.js").getUserId;
    const getPermsMatch = require("../../main.js").getPermsMatch;
    const getSeconds = require("../../main.js").getSeconds;
    let userIds = [];
    let duration = 0;
    let reason = "";
    if (!("guild" in details["message"].channel)) {
        return "guild";
    }
    let permsMissing = getPermsMatch(details["message"].member.permissions, ["banMembers"]);
    if (permsMissing.length > 0) {
        return ["user"].concat(permsMissing);
    }
    let botPermsMissing = getPermsMatch(details["message"].channel.guild.members.get(bot.user.id).permissions, ["banMembers"]);
    if (botPermsMissing.length > 0) {
        return ["self"].concat(botPermsMissing);
    }
    let splitBody = details["body"].split(" ");
    splitBody = splitBody.filter(t => {
        let uid = getUserId(t, ["mention", "id"], details["message"].channel.guild.id);
        if (uid !== "") {
            userIds.push(uid);
            return false;
        }
        let time = getSeconds(t);
        if (time > 0) {
            duration += time;
            return false;
        }
        return true;
    });
    reason = splitBody.join(" ");
    if (!reason) {
        reason = "No reason specified.";
    }
    if (!details["body"] || userIds.length === 0) {
        return "usage";
    }
    let embed = await common(details["message"].author, userIds, details["message"].channel.guild, duration, reason);
    let file = embed.file;
    delete embed.file;
    await details["message"].channel.createMessage({
        messageReferenceID: details["message"].id,
        embed: embed
    }, file);
    return true;
}

module.exports.slash = {
    name: "ban",
    description: "Ban a user.",
    deferEphemeral: false,
    options: [
        {
            name: "user",
            description: "The user to ban.",
            required: true,
            type: CommandOptionType.USER
        },
        {
            name: "duration",
            description: "Duration to ban the user for.",
            required: false,
            type: CommandOptionType.STRING
        },
        {
            name: "reason",
            description: "The reason for this action.",
            required: false,
            type: CommandOptionType.STRING
        }
    ],
    guildOnly: true
}
module.exports.slashAction = async function (ctx) {
    await ctx.defer();
    const bot = require("../../main.js").bot;
    const getPermsMatch = require("../../main.js").getPermsMatch;
    const getSeconds = require("../../main.js").getSeconds;
    let userIds = [ctx.options["user"]];
    let duration = "duration" in ctx.options ? getSeconds(ctx.options["duration"]) : -1;
    let reason = "reason" in ctx.options ? ctx.options["reason"] : "No reason specified.";
    let permsMissing = getPermsMatch(bot.guilds.get(ctx.guildID).members.get(ctx.user.id).permissions, ["banMembers"]);
    if (permsMissing.length > 0) {
        await require("../../main.js").slashPermissionRejection(ctx, ["user"].concat(permsMissing));
        return;
    }
    let botPermsMissing = getPermsMatch(bot.guilds.get(ctx.guildID).members.get(bot.user.id).permissions, ["banMembers"]);
    if (botPermsMissing.length > 0) {
        await require("../../main.js").slashPermissionRejection(ctx, ["self"].concat(botPermsMissing));
        return;
    }
    let embed = await common(ctx.user, userIds, bot.guilds.get(ctx.guildID), duration, reason);
    let file = embed.file;
    delete embed.file;
    await ctx.send({
        embeds: [embed],
        file: file
    });
}

async function common(moderator, users, guild, duration, reason) {
    const settings = require("../../main.js").settings;
    const promisePool = require("../../main.js").promisePool;
    const databaseSync = require("../../main.js").databaseSync;
    const msToTime = require("../../main.js").msToTime;
    const msToTimeString = require("../../main.js").msToTimeString;
    let banSuccess = [];
    let banFail = [];
    let fileBuffer = [];
    if (duration > 0) {
        duration *= 1000;
    }
    let d = new Date();
    d = new Date(d.getTime() + duration);
    for (let member of guild.members.map(m => m.id)) {
        if (users.includes(member)) {
            member = guild.members.get(member);
            try {
                await member.ban(0, `[${moderator.username}#${moderator.discriminator}] ${reason}`);
                banSuccess.push(member.id);
                if (duration > 0) {
                    if (settings.get("dev")) {
                        await promisePool.execute("INSERT INTO `bans_warden_dev` (`guildid`, `userid`, `expires`) VALUES (?, ?, ?)", [guild.id, member.id, d.getTime()]);
                    }
                    else {
                        await promisePool.execute("INSERT INTO `bans_warden` (`guildid`, `userid`, `expires`) VALUES (?, ?, ?)", [guild.id, member.id, d.getTime()]);
                    }
                }
                await databaseSync();
                fileBuffer.push(`[✓] Banned ${member.username}#${member.discriminator}`);
            } catch (e) {
                banFail.push(member.id);
                fileBuffer.push(`[!] Failed to ban ${member.username}#${member.discriminator} (detailed error below)`);
                fileBuffer.push(e);
            }
        }
    }
    return {
        description: `Successfully banned **${banSuccess.length}** user${banSuccess.length === 1 ? "" : "s"}${banFail.length > 0 ? ` and failed to ban **${banFail.length}** user${banFail.length === 1 ? "" : "s"}` : ""}.\nDuration: \`${duration > 0 ? msToTimeString(msToTime(duration)) : "Permanent"}\`\nReason: \`${reason}\``,
        color: 0x2518a0,
        file: {
            file: Buffer.from(fileBuffer.join("\n")),
            name: "log.txt"
        }
    };
}