module.exports.commands = ["leave", "disconnect", "dc"];
module.exports.usage = "%cmd%";
module.exports.description = "Stop TTS and leave the voice channel.";
module.exports.action = async function (details) {
    if (!details["guild"]) {
        return "guild";
    }
    let result = await common(details["message"].channel.guild.id, details["message"].author.id);
    let resultString = "";
    switch (result) {
        case "session":
            resultString = "There is no ongoing session in this server.";
            break;
        case "vc":
            resultString = "You are not in a voice channel.";
            break;
        case "different":
            resultString = "You are not in the same voice channel as me.";
            break;
        case "success":
            resultString = "Successfully stopped and disconnected.";
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
    name: "leave",
    description: "Stop TTS and leave the voice channel.",
    deferEphemeral: false,
    guildOnly: true
}
module.exports.slashAction = async function (ctx) {
    let result = await common(ctx.guildID, ctx.user.id);
    let resultString = "";
    switch (result) {
        case "session":
            resultString = "There is no ongoing session in this server.";
            break;
        case "vc":
            resultString = "You are not in a voice channel.";
            break;
        case "different":
            resultString = "You are not in the same voice channel as me.";
            break;
        case "success":
            resultString = "Successfully stopped and disconnected.";
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
            ephemeral: result !== "success"
        });
    }
}

async function common(gid, uid) {
    const {bot} = require("../../main.js");
    if (!bot.guilds.get(gid).members.get(bot.user.id).voiceState.channelID) {
        return "session";
    }
    if (!bot.guilds.get(gid).members.get(uid).voiceState.channelID) {
        return "vc";
    }
    if (bot.guilds.get(gid).members.get(bot.user.id).voiceState.channelID && bot.guilds.get(gid).members.get(bot.user.id).voiceState.channelID !== bot.guilds.get(gid).members.get(uid).voiceState.channelID) {
        return "different";
    }
    let {ttsQueue, timeouts} = require("./ttshandler.js");
    delete ttsQueue[gid];
    if (gid in timeouts) {
        clearTimeout(timeouts[gid]);
        delete timeouts[gid];
    }
    await bot.leaveVoiceChannel(bot.guilds.get(gid).members.get(bot.user.id).voiceState.channelID);
    return "success";
}