module.exports.commands = ["stop"];
module.exports.usage = "%cmd%";
module.exports.description = "Stop TTS.";
module.exports.action = async function (details) {
    let result = await common(details["message"].channel.guild.id, details["message"].author.id);
    let resultString = "";
    switch (result) {
        case "vc":
            resultString = "You are not in a voice channel.";
            break;
        case "different":
            resultString = "You are not in the same voice channel as me.";
            break;
        case "free":
            resultString = "I'm not currently in the middle of a TTS message.";
            break;
        case "success":
            resultString = "Successfully stopped.";
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
    name: "stop",
    description: "Stop TTS.",
    deferEphemeral: false,
    guildOnly: true
}
module.exports.slashAction = async function (ctx) {
    let result = await common(ctx.guildID, ctx.user.id);
    let resultString = "";
    switch (result) {
        case "vc":
            resultString = "You are not in a voice channel.";
            break;
        case "different":
            resultString = "You are not in the same voice channel as me.";
            break;
        case "free":
            resultString = "I'm not currently in the middle of a TTS message.";
            break;
        case "success":
            resultString = "Successfully stopped.";
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
    const {getPlayer} = require("./ttshandler.js");
    if (!bot.guilds.get(gid).members.get(uid).voiceState.channelID) {
        return "vc";
    }
    if (bot.guilds.get(gid).members.get(bot.user.id).voiceState.channelID && bot.guilds.get(gid).members.get(bot.user.id).voiceState.channelID !== bot.guilds.get(gid).members.get(uid).voiceState.channelID) {
        return "different";
    }
    let {ttsQueue, timeouts} = require("./ttshandler.js");
    if (!(gid in ttsQueue)) {
        return "free";
    }
    delete ttsQueue[gid];
    timeouts[gid] = setTimeout(cid => {
        bot.leaveVoiceChannel(cid);
    }, 300000, bot.guilds.get(gid).members.get(bot.user.id).voiceState.channelID);
    let player = await getPlayer(bot.guilds.get(gid).channels.get(bot.guilds.get(gid).members.get(bot.user.id).voiceState.channelID)).p;
    player.stop();
    return "success";
}