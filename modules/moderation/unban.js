const {CommandOptionType} = require("slash-create");

module.exports.commands = ["unban"];
module.exports.usage = "%cmd% @mention [@mention] [reason]";
module.exports.description = "Unban user(s).";
module.exports.action = async function (details) {
    const bot = require("../../main.js").bot;
    const getUserId = require("../../main.js").getUserId;
    const getPermsMatch = require("../../main.js").getPermsMatch;
    let userIds = [];
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
        return true;
    });
    reason = splitBody.join(" ");
    if (!reason) {
        reason = "No reason specified.";
    }
    if (!details["body"] || userIds.length === 0) {
        return "usage";
    }
    let embed = await common(details["message"].author, userIds, details["message"].channel.guild, reason);
    let file = embed.file;
    delete embed.file;
    await details["message"].channel.createMessage({
        messageReference: {messageID: details["message"].id},
        embed: embed
    }, file);
    return true;
}

module.exports.slash = {
    name: "unban",
    description: "Unban a user.",
    deferEphemeral: false,
    options: [
        {
            name: "user",
            description: "The user to unban.",
            required: true,
            type: CommandOptionType.USER
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
    let userIds = [ctx.options["user"]];
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
    let embed = await common(ctx.user, userIds, bot.guilds.get(ctx.guildID), reason);
    let file = embed.file;
    delete embed.file;
    await ctx.send({
        embeds: [embed],
        file: file
    });
}

async function common(moderator, users, guild, reason) {
    const settings = require("../../main.js").settings;
    const promisePool = require("../../main.js").promisePool;
    const databaseSync = require("../../main.js").databaseSync;
    let unbanSuccess = [];
    let unbanFail = [];
    let fileBuffer = [];
    for (let member of users) {
        try {
            await guild.unbanMember(member, `[${moderator.username}#${moderator.discriminator}] ${reason}`);
            unbanSuccess.push(member);
            if (settings.get("dev")) {
                promisePool.execute("DELETE FROM `bans_warden_dev` WHERE `guildid` = ? AND `userid` = ?", [guild.id, member]);
            }
            else {
                promisePool.execute("DELETE FROM `bans_warden` WHERE `guildid` = ? AND `userid` = ?", [guild.id, member]);
            }
            await databaseSync();
            fileBuffer.push(`[✓] Unbanned ${member}`);
        } catch (e) {
            unbanFail.push(member);
            fileBuffer.push(`[!] Failed to unban ${member} (detailed error below)`);
            fileBuffer.push(e);
        }
    }
    return {
        description: `Successfully unbanned **${unbanSuccess.length}** user${unbanSuccess.length === 1 ? "" : "s"}${unbanFail.length > 0 ? ` and failed to unban **${unbanFail.length}** user${unbanFail.length === 1 ? "" : "s"}` : ""}.\nReason: \`${reason}\``,
        color: 0x2518a0,
        file: {
            file: Buffer.from(fileBuffer.join("\n")),
            name: "log.txt"
        }
    };
}