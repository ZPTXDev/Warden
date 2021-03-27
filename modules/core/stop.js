module.exports.commands = ["stop"];
module.exports.usage = "%cmd%";
module.exports.description = "Stop Warden gracefully.";
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

module.exports.slash = {
    name: "stop",
    description: "Stop Warden gracefully."
};
module.exports.slashAction = async function(ctx) {
    const settings = require("../../main.js").settings;
    const managers = settings.get("managers");
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
    console.log("[!] Gracefully stopping Warden")
    ctx.send({
        embeds: [
            {
                description: "Gracefully stopping Warden",
                color: 0x2518a0
            }
        ]
    }).finally(() => {
        process.exit(0);
    });
}