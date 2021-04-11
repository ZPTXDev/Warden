module.exports.commands = ["prefix"];
module.exports.usage = "%cmd% prefix [space]";
module.exports.description = "Set Warden's prefix.";
module.exports.action = function (details) {
    const promisePool = require("../../main.js").promisePool;
    const getPermsMatch = require("../../main.js").getPermsMatch;
    const databaseSync = require("../../main.js").databaseSync;
    let space = false;
    if (!("guild" in details["message"].channel)) {
        return "guild";
    }
    let permsMissing = getPermsMatch(details["message"].member.permissions, ["manageGuild"]);
    if (permsMissing.length > 0) {
        return ["user"].concat(permsMissing);
    }
    if (details["body"].endsWith("space")) {
        details["body"] = details["body"].slice(0, -5).trimEnd();
        space = true;
    }
    if (!details["body"]) {
        return "usage";
    }
    let prefix = details["body"];
    if (space) {
        prefix = `${prefix} `;
    }
    promisePool.execute("INSERT INTO `guilds_warden` (`guildid`, `prefix`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `prefix` = VALUES(`prefix`)", [details["message"].channel.guild.id, prefix]);
    databaseSync();
    details["message"].channel.createMessage({
        messageReferenceID: details["message"].id,
        embed: {
            description: `Prefix for **${details["message"].channel.guild.name}** set to \`${prefix}\``,
            color: 0x2518a0
        }
    });
    return true;
}