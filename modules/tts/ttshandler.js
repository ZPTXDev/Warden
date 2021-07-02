let ttsQueue = {};
let timeouts = {};

async function getPlayer(channel) {
    const {bot} = require("../../main.js");
    if (!channel || !channel.guild) {
        return Promise.reject('Not a guild channel.');
    }
    let player = bot.voiceConnections.get(channel.guild.id);
    if (player) {
        return {p: Promise.resolve(player), n: false};
    }
    return {p: bot.joinVoiceChannel(channel.id), n: true};
}

async function resolveTracks(node, search) {
    const superagent = require("superagent");
    const result = await superagent.get(`http://${node.host}:${node.port}/loadtracks?identifier=${search}`)
        .set('Authorization', node.password)
        .set('Accept', 'application/json');
    if (!result) {
        throw "Unable to play that track.";
    }
    return result.body;
}

async function tts(channel, text, tc) {
    let {bot, settings} = require("../../main.js");
    const { PlayerManager } = require("eris-lavalink");
    const discordTTS = require("discord-tts");
    const fs = require('fs');
    if (!(bot.voiceConnections instanceof PlayerManager)) {
        bot.voiceConnections = new PlayerManager(bot, settings.get("llnodes"), {
            numShards: bot.shards.size, // number of shards
            userId: bot.user.id // the user id of the bot
        });
    }
    let player = getPlayer(channel);
    let nPlayer = player.n;
    player = await player.p;
    if (channel.guild.id in timeouts) {
        clearTimeout(timeouts[channel.guild.id]);
        delete timeouts[channel.guild.id];
    }
    ttsQueue[channel.guild.id] = [];
    let textSplit = [];
    let currText = [];
    text.split(" ").forEach(t => {
        currText.push(t);
        if (currText.join(" ").length >= 200) {
            currText.pop();
            textSplit.push(currText.join(" "));
            currText = [t];
        }
    });
    textSplit.push(currText.join(" "));
    for (const u of textSplit) {
        await discordTTS.saveToFile(`${__dirname}/${channel.guild.id}.mp3`, u, {lang: 'en'});
        let msg = await tc.createMessage(null, {file: fs.readFileSync(`${__dirname}/${channel.guild.id}.mp3`), name: `${channel.guild.id}.mp3`});
        let track = await resolveTracks(settings.get("llnodes")[0], msg.attachments[0].url);
        ttsQueue[channel.guild.id].push(track);
        await fs.unlinkSync(`${__dirname}/${channel.guild.id}.mp3`);
    }
    player.play(ttsQueue[channel.guild.id][0]);
    ttsQueue[channel.guild.id].shift();
    if (nPlayer) {
        function left() {
            delete ttsQueue[channel.guild.id];
        }
        player.on("disconnect", left);
        player.on("error", left);
        player.on("stuck", left);
        player.on("end", d => {
            if (d.reason && d.reason === 'REPLACED') {return;}
            if (ttsQueue[channel.guild.id].length > 0) {
                player.play(ttsQueue[channel.guild.id][0]);
                ttsQueue[channel.guild.id].shift();
            }
            else {
                delete ttsQueue[channel.guild.id];
                timeouts[channel.guild.id] = setTimeout(cid => {
                    bot.leaveVoiceChannel(cid);
                }, 300000, channel.id);
            }
        });
    }
}

module.exports.ttsQueue = ttsQueue;
module.exports.tts = tts;