const {SlashCommand} = require("slash-create");

module.exports.slash = class StopCommand extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: "stop",
            description: "Stop Warden gracefully."
        });
    }
    async run(ctx) {
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
}