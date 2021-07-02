let ttsQueue = {};
let timeouts = {};

function getPlayer(channel) {
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
    const googleTTS = require("google-tts-api");
    let play = getPlayer(channel);
    let nPlayer = play.n;
    play = await play.p;
    if (channel.guild.id in timeouts) {
        clearTimeout(timeouts[channel.guild.id]);
        delete timeouts[channel.guild.id];
    }
    ttsQueue[channel.guild.id] = [];
    let base64s = await googleTTS.getAllAudioBase64(text);
    for (const u of base64s) {
        let msg = await tc.createMessage("", {file: Buffer.from(u.base64, "base64"), name: `${channel.guild.id}.mp3`});
        let track = await resolveTracks(settings.get("llnodes")[0], msg.attachments[0].url);
        track = track.tracks[0].track;
        ttsQueue[channel.guild.id].push(track);
    }
    play.play(ttsQueue[channel.guild.id][0]);
    ttsQueue[channel.guild.id].shift();
    if (nPlayer) {
        function left() {
            delete ttsQueue[channel.guild.id];
        }
        play.on("disconnect", left);
        play.on("error", left);
        play.on("stuck", left);
        play.on("end", d => {
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