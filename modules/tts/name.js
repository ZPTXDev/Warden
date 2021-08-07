module.exports.commands = ["name"];
module.exports.usage = "%cmd% username|nickname|none";
module.exports.description = "Configure TTS to use names.";
module.exports.action = async function (details) {
    const {settings, getPermsMatch, promisePool, databaseSync} = require("../../main.js");
    const types = ["none", "username", "nickname"];
    if (!details["guild"]) {
        return "guild";
    }
    if (details["body"] === "" || !types.includes(details["body"].toLowerCase())) {
        return "usage";
    }
    let permsMissing = getPermsMatch(details["message"].member.permissions, ["manageGuild"]);
    if (permsMissing.length > 0) {
        return ["user"].concat(permsMissing);
    }
    const typeInt = types.indexOf(details["body"].toLowerCase());
    if (settings.get("dev")) {
        await promisePool.execute("INSERT INTO `guilds_warden_dev` (`guildid`, `tts_name`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `tts_name` = VALUES(`tts_name`)", [details["message"].channel.guild.id, typeInt]);
    }
    else {
        await promisePool.execute("INSERT INTO `guilds_warden` (`guildid`, `tts_name`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `tts_name` = VALUES(`tts_name`)", [details["message"].channel.guild.id, typeInt]);
    }
    await databaseSync();
    await details["message"].channel.createMessage({
        messageReference: {messageID: details["message"].id},
        embed: {
            description: typeInt !== 0 ? `TTS will now use **${types[typeInt]}** before messages.` : "TTS will not specify names before messages.",
            color: 0x2518a0
        }
    });
    return true;
}