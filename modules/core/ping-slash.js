const {SlashCommand} = require("slash-create");

module.exports.slash = class Command extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: "ping",
            description: "Check if Warden is currently available."
        });
    }
    async run(ctx) {
        await ctx.send({
            embeds: [
                {
                    description: `Pong!`,
                    color: 0x2518a0
                }
            ]
        });
    }
}