module.exports.commands = ["stop"];
module.exports.usage = "%cmd%";
module.exports.action = function (details) {
    const settings = require("../../main.js").settings;
    const managers = settings.get("managers");
    if (!managers.includes(details["message"].author.id)) {
        return "manager";
    }
    console.log("[!] Gracefully stopping Warden")
    details["message"].channel.createMessage({
        messageReferenceID: details["message"].id,
        embed: {
            description: "Gracefully stopping Warden",
            color: 0x2518a0
        }
    }).finally(() => {
        process.exit(0);
    });
    return true;
}