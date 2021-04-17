const {CommandOptionType} = require("slash-create");

module.exports.commands = ["miccheck"];
module.exports.usage = "%cmd% [%mention%]"
module.exports.description = "It's time for a mic check.";
module.exports.action = async function (details) {
    const getUserId = require("../../main.js").getUserId;
    let userId;
    if (!("guild" in details["message"].channel)) {
        return "guild";
    }
    if (details["body"]) {
        userId = getUserId(details["body"], null, details["message"].channel.guild.id);
    }
    if (!userId) {
        let embed = await common("stop", details["message"].channel.guild);
        await details["message"].channel.createMessage({
            messageReferenceId: details["message"].id,
            embed: embed
        });
        return true;
    }
    let user = details["message"].channel.guild.members.get(userId);
    let embed = await common(user, details["message"].channel.guild, details["message"].member);
    await details["message"].channel.createMessage({
        messageReferenceId: details["message"].id,
        embed: embed
    });
    return true;
}

module.exports.slash = {
    name: "miccheck",
    description: "It's time for a mic check.",
    deferEphemeral: false,
    options: [
        {
            name: "user",
            description: "The user to mic check.",
            required: false,
            type: CommandOptionType.USER
        }
    ],
    guildOnly: true
}
module.exports.slashAction = async function(ctx) {
    const bot = require("../../main.js").bot;
    if (!("user" in ctx.options)) {
        let embed = await common("stop", bot.guilds.get(ctx.guildID));
        await ctx.send({
            embeds: [embed]
        });
    }
    let guild = bot.guilds.get(ctx.guildID);
    let user = guild.members.get(ctx.options["user"]);
    let initiator = guild.members.get(ctx.user.id);
    let embed = await common(user, guild, initiator);
    await ctx.send({
        embeds: [embed]
    });
}

async function common(user, guild, initiator) {
    const bot = require("../../main.js").bot;
    if (user === "stop") {
        if (guild.members.get(bot.user.id).voiceState.channelID !== null) {
            await bot.leaveVoiceChannel(guild.members.get(bot.user.id).voiceState.channelID);
            return {
                description: "Stopped mic check playback.",
                color: 0x2518a0
            };
        }
        else {
            return {
                description: "Mic check is not active.",
                color: 0x2518a0
            };
        }
    }
    if (user.voiceState.channelID === null) {
        return {
            description: "Target user is not in a voice channel.",
            color: 0x2518a0
        };
    }
    if (initiator.voiceState.channelID === null || initiator.voiceState.channelID !== user.voiceState.channelID) {
        return {
            description: "You are not in the same voice channel as the target user.",
            color: 0x2518a0
        };
    }
    let channel = guild.channels.get(user.voiceState.channelID);
    let voiceConnection = await channel.join();
    let receive = voiceConnection.receive("opus");
    voiceConnection.on("ready", () => {
        voiceConnection.play(receive);
    });
    voiceConnection.on("end", () => {
        bot.leaveVoiceChannel(channel.id);
    });
    return {
        description: `Now performing mic check for user **${user.username}#${user.discriminator}**\nEnd it by typing this command without any arguments`,
        color: 0x2518a0
    };
}