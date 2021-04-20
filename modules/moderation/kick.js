const {CommandOptionType} = require("slash-create");

module.exports.commands = ["kick"];
module.exports.usage = "%cmd% @mention [@mention] [reason]";
module.exports.description = "Kick user(s).";
module.exports.action = async function (details) {
    const bot = require("../../main.js").bot;
    const getUserId = require("../../main.js").getUserId;
    const getPermsMatch = require("../../main.js").getPermsMatch;
    let userIds = [];
    let reason = "";
    if (!("guild" in details["message"].channel)) {
        return "guild";
    }
    let permsMissing = getPermsMatch(details["message"].member.permissions, ["kickMembers"]);
    if (permsMissing.length > 0) {
        return ["user"].concat(permsMissing);
    }
    let botPermsMissing = getPermsMatch(details["message"].channel.guild.members.get(bot.user.id).permissions, ["kickMembers"]);
    if (botPermsMissing.length > 0) {
        return ["self"].concat(botPermsMissing);
    }
    let splitBody = details["body"].split(" ");
    let newBody = [];
    splitBody.filter(t => {
        let uid = getUserId(t, ["mention", "id"], details["message"].channel.guild.id);
        if (uid !== "") {
            userIds.push(uid);
        }
        else {
            newBody.push(t);
        }
    });
    reason = newBody.join(" ");
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
        messageReferenceID: details["message"].id,
        embed: embed,
        file: file
    });
    return true;
}

module.exports.slash = {
    name: "kick",
    description: "Kick a user.",
    deferEphemeral: false,
    options: [
        {
            name: "user",
            description: "The user to kick.",
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
    const bot = require("../../main.js").bot;
    const getPermsMatch = require("../../main.js").getPermsMatch;
    let userIds = [ctx.options["user"]];
    let reason = "reason" in ctx.options ? ctx.options["reason"] : "No reason specified.";
    let permsMissing = getPermsMatch(bot.guilds.get(ctx.guildID).members.get(ctx.user.id).permissions, ["kickMembers"]);
    if (permsMissing.length > 0) {
        await require("../../main.js").slashPermissionRejection(ctx, ["user"].concat(permsMissing));
        return;
    }
    let botPermsMissing = getPermsMatch(bot.guilds.get(ctx.guildID).members.get(bot.user.id).permissions, ["kickMembers"]);
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
    let kickSuccess = [];
    let kickFail = [];
    let fileBuffer = [];
    for (let member of guild.members.map(m => m.id)) {
        if (users.includes(member)) {
            member = guild.members.get(member);
            try {
                await member.kick(`[${moderator.username}#${moderator.discriminator}] ${reason}`);
                kickSuccess.push(member.id);
                fileBuffer.push(`[✓] Kicked ${member.username}#${member.discriminator} for: ${reason}`);
            } catch (e) {
                kickFail.push(member.id);
                fileBuffer.push(`[!] Failed to kick ${member.username}#${member.discriminator} (detailed error below)`);
                fileBuffer.push(e);
            }
        }
    }
    return {
        description: `Successfully kicked **${kickSuccess.length}** user${kickSuccess.length === 1 ? "" : "s"}${kickFail.length > 0 ? ` and failed to kick **${kickFail.length}** user${kickFail.length === 1 ? "" : "s"}` : ""}.\nReason: \`${reason}\``,
        color: 0x2518a0,
        file: {
            file: new Buffer(fileBuffer.join("\n")),
            name: "log.txt"
        }
    };
}

