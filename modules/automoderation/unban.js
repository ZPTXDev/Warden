const bot = require("../../main.js").bot;
const databaseSync = require("../../main.js").databaseSync;
const promisePool = require("../../main.js").promisePool;
const bans = require("../../main.js").bans;
// is this bad for performance? hopefully not?
// https://stackoverflow.com/questions/12810622/nodejs-setinterval-bad-for-performance
const unbanInterval = setInterval(async () => {
    let unbanned = false;
    Object.keys(bans).forEach(b => {
        bans[b].forEach(ban => {
            if (ban["expires"] < new Date().getTime()) {
                bot.unbanGuildMember(b, ban["userid"], "[Automod] Ban expired");
                if (settings.get("dev")) {
                    promisePool.execute("DELETE FROM `bans_warden_dev` WHERE `guildid` = ? AND `userid` = ?", [b, ban["userid"]]);
                }
                else {
                    promisePool.execute("DELETE FROM `bans_warden` WHERE `guildid` = ? AND `userid` = ?", [b, ban["userid"]]);
                }
                unbanned = true;
            }
        });
    });
    if (unbanned) {
        // don't constantly make calls to the db, only do that if we're unbanning someone and need db updated
        await databaseSync();
    }
}, 1000);