const {CommandOptionType} = require("slash-create");

module.exports.commands = ["say"];
module.exports.usage = "%cmd% message"
module.exports.description = "Use TTS to say something in your voice channel.";
module.exports.action = async function (details) {
    const {getPermsMatch, bot} = require("../../main.js");
    if (details["body"] === "") {
        return "usage";
    }
    let botPermsMissing = getPermsMatch(details["message"].channel.guild.members.get(bot.user.id).permissions, ["voiceConnect", "voiceSpeak", "attachFiles", "sendMessages"]);
    if (botPermsMissing.length > 0) {
        return ["self"].concat(botPermsMissing);
    }
    let result = await common(details["message"].channel.guild.id, details["message"].author.id, details["message"].channel.id, details["body"]);
    let resultString = "";
    switch (result) {
        case "disabled":
            resultString = "This feature was not set up and is disabled.";
            break;
        case "vc":
            resultString = "You are not in a voice channel.";
            break;
        case "different":
            resultString = "You are not in the same voice channel as me.";
            break;
        case "busy":
            resultString = "I'm currently in the middle of another TTS message.";
            break;
        case "success":
            resultString = `"**${details["message"].author.username}**: ${details["body"]}`;
            break;
    }
    if (resultString) {
        await details["message"].channel.createMessage({
            messageReference: {messageID: details["message"].id},
            embed: {
                description: resultString,
                color: 0x2518a0
            }
        });
    }

}

module.exports.slash = {
    name: "say",
    description: "Use TTS to say something in your voice channel.",
    deferEphemeral: false,
    options: [
        {
            name: "message",
            description: "The message to say.",
            required: true,
            type: CommandOptionType.STRING
        }
    ],
    guildOnly: true
}
module.exports.slashAction = async function (ctx) {
    const {getPermsMatch, bot} = require("../../main.js");
    let botPermsMissing = getPermsMatch(bot.guilds.get(ctx.guildID).members.get(bot.user.id).permissions, ["voiceConnect", "voiceSpeak", "attachFiles", "sendMessages"]);
    if (botPermsMissing.length > 0) {
        await require("../../main.js").slashPermissionRejection(ctx, ["self"].concat(botPermsMissing));
        return;
    }
    let result = await common(ctx.guildID, ctx.user.id, ctx.channelID, ctx.options["message"]);
    let resultString = "";
    switch (result) {
        case "disabled":
            resultString = "This feature was not set up and is disabled.";
            break;
        case "vc":
            resultString = "You are not in a voice channel.";
            break;
        case "different":
            resultString = "You are not in the same voice channel as me.";
            break;
        case "busy":
            resultString = "I'm currently in the middle of another TTS message.";
            break;
        case "success":
            resultString = `"**${ctx.user.username}**: ${ctx.options["message"]}`;
            break;
    }
    if (resultString) {
        await ctx.send({
            embeds: [
                {
                    description: resultString,
                    color: 0x2518a0
                }
            ],
            ephemeral: true
        });
    }
}

async function common(gid, uid, cid, text) {
    const {settings, bot} = require("../../main.js");
    if (!settings.get("llnodes")) {
        return "disabled";
    }
    if (!bot.guilds.get(gid).members.get(uid).voiceState.channelID) {
        return "vc";
    }
    if (bot.guilds.get(gid).members.get(bot.user.id).voiceState.channelID && bot.guilds.get(gid).members.get(bot.user.id).voiceState.channelID !== bot.guilds.get(gid).members.get(uid).voiceState.channelID) {
        return "different";
    }
    let {ttsQueue, tts} = require("./ttshandler.js");
    if (gid in ttsQueue) {
        return "busy";
    }
    await tts(bot.guilds.get(gid).channels.get(bot.guilds.get(gid).members.get(uid).voiceState.channelID), text, bot.guilds.get(gid).channels.get(cid));
    return "success";
}