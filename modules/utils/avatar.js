const {CommandOptionType} = require("slash-create");

module.exports.commands = ["avatar"];
module.exports.usage = "%cmd% [%mention%] [options]"
module.exports.description = "Display a user's avatar.";
module.exports.action = function (details) {
    const getUserId = require("../../main.js").getUserId;
    let userId;
    let options = false;
    if (details["body"].endsWith(" options")) {
        details["body"] = details["body"].slice(0, -8);
        options = true;
    }
    if (details["body"]) {
        userId = getUserId(details["body"], null, details["message"].channel.guild.id);
    }
    if (!userId) {
        userId = details["message"].author.id;
    }
    let user = details["message"].channel.guild.members.get(userId).user;
    let animated = user.avatar.startsWith("a_");
    let sizes = "";
    let start = 4096;
    while (start >= 16) {
        sizes += `[${start.toString()}](${user.dynamicAvatarURL(animated ? "gif" : "png", start)})`;
        start /= 2;
    }
    details["message"].channel.createMessage({
        messageReferenceID: details["message"].id,
        embed: {
            title: `${user.username}#${user.discriminator}`,
            description: `${options ? `**Formats**:\n${animated ? `[gif](${user.dynamicAvatarURL("gif", 2048)}) | ` : ""}[png](${user.dynamicAvatarURL("png", 2048)}) | [jpg](${user.dynamicAvatarURL("jpg", 2048)}) | [webp](${user.dynamicAvatarURL("webp", 2048)})\n**Sizes**:\n${sizes}` : `[External Link](${user.avatarURL})`}`,
            image: {
                url: `${animated ? user.dynamicAvatarURL("gif", 2048) : user.dynamicAvatarURL("png", 2048)}`
            },
            color: 0x2518a0
        }
    });
    return true;
}