const {CommandOptionType} = require("slash-create");

module.exports.commands = ["avatar"];
module.exports.usage = "%cmd% [%mention%] [options]"
module.exports.description = "Display a user's avatar.";
module.exports.action = function (details) {
    const getUserId = require("../../main.js").getUserId;
    let userId;
    let options = false;
    if (!("guild" in details["message"].channel)) {
        return "guild";
    }
    if (details["body"].endsWith("options")) {
        details["body"] = details["body"].slice(0, -7).trimEnd();
        options = true;
    }
    if (details["body"]) {
        userId = getUserId(details["body"], null, details["message"].channel.guild.id);
    }
    if (!userId) {
        userId = details["message"].author.id;
    }
    let user = details["message"].channel.guild.members.get(userId).user;
    let embed = common(user, options);
    details["message"].channel.createMessage({
        messageReference: {messageID: details["message"].id},
        embed: embed
    });
    return true;
}

module.exports.slash = {
    name: "avatar",
    description: "Display a user's avatar.",
    deferEphemeral: false,
    options: [
        {
            name: "user",
            description: "The user to display an avatar for.",
            required: false,
            type: CommandOptionType.USER
        },
        {
            name: "options",
            description: "Show all format and size variations for the avatar.",
            required: false,
            type: CommandOptionType.BOOLEAN
        }
    ],
    guildOnly: true
};
module.exports.slashAction = async function (ctx) {
    await ctx.defer();
    const bot = require("../../main.js").bot;
    let userId;
    let options = false;
    if (ctx.options["options"]) {
        options = true;
    }
    if (ctx.options["user"] && !!ctx.guildID) {
        userId = ctx.options["user"];
    }
    else {
        userId = ctx.user.id;
    }
    let user = bot.guilds.get(ctx.guildID).members.get(userId);
    user = user ? user.user : bot.guilds.get(ctx.guildID).members.get(ctx.user.id).user;
    let embed = common(user, options);
    await ctx.send({
        embeds: [embed]
    });
}

function common(user, options) {
    let animated = user.avatar && user.avatar.startsWith("a_");
    if (!user.avatar && options) {
        options = false;
    }
    let sizes = [];
    let start = 4096;
    while (start >= 16) {
        sizes.push(`[${start.toString()}](${user.dynamicAvatarURL(animated ? "gif" : "png", start)})`);
        start /= 2;
    }
    sizes = sizes.join(" | ");
    return {
        title: `${user.username}#${user.discriminator}`,
        description: `${options ? `**Formats**:\n${animated ? `[gif](${user.dynamicAvatarURL("gif", 2048)}) | ` : ""}[png](${user.dynamicAvatarURL("png", 2048)}) | [jpg](${user.dynamicAvatarURL("jpg", 2048)}) | [webp](${user.dynamicAvatarURL("webp", 2048)})\n**Sizes**:\n${sizes}` : `[External Link](${user.avatarURL})`}`,
        image: {
            url: `${animated ? user.dynamicAvatarURL("gif", 2048) : user.dynamicAvatarURL("png", 2048)}`
        },
        color: 0x2518a0
    };
}