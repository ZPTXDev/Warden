const { PlayerManager } = require("eris-lavalink");
const superagent = require("superagent");
const googleTTS = require("google-tts-api");

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
    const result = await superagent.get(`http://${node.host}:${node.port}/loadtracks?identifier=${search}`)
        .set('Authorization', node.password)
        .set('Accept', 'application/json');
    if (!result) {
        throw "Unable to play that track.";
    }
    return result.body;
}

async function tts(channel, text) {
    let {bot, settings} = require("../../main.js");
    if (!(bot.voiceConnections instanceof PlayerManager)) {
        bot.voiceConnections = new PlayerManager(bot, settings.get("llnodes"), {
            numShards: bot.shards.size, // number of shards
            userId: bot.user.id // the user id of the bot
        });
    }
    let player = await getPlayer(channel);
    let nPlayer = player.n;
    player = await player.p;
    if (channel.guild.id in timeouts) {
        clearTimeout(timeouts[channel.guild.id]);
        delete timeouts[channel.guild.id];
    }
    const urls = googleTTS.getAllAudioUrls(text, {
        splitPunct: ',.?'
    });
    ttsQueue[channel.guild.id] = [];
    for (const u of urls) {
        let track = await resolveTracks(settings.get("llnodes")[0], u.url);
        ttsQueue[channel.guild.id].push(track);
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