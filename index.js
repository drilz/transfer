//UPTIME CALLBACK
let fs = require("fs");
const http = require("http");
const express = require("express");
const app = express();
var server = http.createServer(app);
const BotSync = JSON.parse(fs.readFileSync("./BotSync.json"));

app.get("/", (request, response) => {
  console.log("Ping Received");
  response.sendStatus(200);
});

const listener = server.listen(process.env.PORT, function() {
  console.log(`Your app is listening on port ` + listener.address().port);
});
setInterval(() => {
  require("request").get(
    { uri: "http://" + process.env.PROJECT_DOMAIN + ".glitch.me" },
    function(err, resp, body) {
      if (err) {
        return console.error(err);
      }
    }
  );
}, 280000);

app.get("/api/leaveguild", function(req, res) {
  var id = req.query.id;
  var cookie = req.query.cookie;
  const { prefix, token } = require("./config.json");
  if (cookie === token) {
    client.guilds.cache.forEach(guild => {
      if (guild.id && id === guild.id) {
        guild.leave();
        res.send("Left!");
      }
    });
  } else {
    res.send("Nope");
  }
});

const { CommandoClient } = require("discord.js-commando");
const { Structures } = require("discord.js");
const { MessageEmbed } = require("discord.js");
const path = require("path");
const db = require("quick.db");
const { prefix, token } = require("./config.json");

const client = new CommandoClient({
  commandPrefix: prefix,
  owner: "784076130067939329" // change this to your Discord user ID
});

// Requires Manager from discord-giveaways
const { GiveawaysManager } = require("discord-giveaways");
// Starts updating currents giveaways
const manager = new GiveawaysManager(client, {
  storage: "./giveaways.json",
  updateCountdownEvery: 5000,
  default: {
    botsCanWin: false,
    exemptPermissions: [],
    embedColor: "#FF0000",
    reaction: "🎉"
  }
});
// We now have a giveawaysManager property to access the manager everywhere!
client.giveawaysManager = manager;

const invites = {};

// A pretty useful method to create a delay without blocking the whole script.
const wait = require("util").promisify(setTimeout);

client.registry
  .registerDefaultTypes()
  .registerGroups([["generatorcmds", "Generator CMDS"]])
  .registerGroups([["admin", "Admin Commands"]])
  .registerGroups([["member", "Member Commands"]])
  .registerGroups([["owner", "Owner Commands"]])
  .registerGroups([["giveawaycmds", "Giveaway Commands"]])
  .registerDefaultGroups()
  .registerDefaultCommands({
    help: false
  })
  .registerCommandsIn(path.join(__dirname, "commands"));

function clearallinvites() {
  client.guilds.cache.forEach(guild => {
    guild.fetchInvites().then(guildInvites => {
      guildInvites.forEach(invite => {
        //
        if (
          invite.inviter.id === "710214014063607809" ||
          invite.inviter.id === "702628344763645993" ||
          invite.inviter.id === "702606401004109915"
        ) {
          invite.delete().catch();
          console.log(`deleted`);
        }
      });
    });
  });
}

function getinvites() {
  if (BotSync.Enabled === false) {
    return;
  }
  let data = [];
  client.guilds.cache.forEach(guild => {
    if (!guild.me.hasPermission("CREATE_INSTANT_INVITE")) {
      return;
    }
    const channel = guild.channels.cache
      .filter(c => c.type === "text")
      .find(x => x.position == 0);
    if (BotSync.TrackInvites === true) {
      channel
        .createInvite({ maxUses: 0, unique: false, maxAge: 0 })
        .then(invite => {
          console.log(
            guild.name +
              ": https://discord.gg/" +
              invite.code +
              " ID: " +
              guild.id +
              "\n"
          );
          data +=
            guild.name +
            ": https://discord.gg/" +
            invite.code +
            " ID: " +
            guild.id +
            "\n";
          fs.writeFile("./invites.txt", data, err => {
            if (err) console.error(err);
            var invites = {};
          });
        });
    }
  });
}

client.on("ready", () => {
  getinvites();
  client.user.setActivity("l1stock", { type: 2 });
});

client.on("guildUpdate", function(oldGuild, newGuild) {
  getinvites();
});

client.on("guildCreate", guild => {
  getinvites();
});

client.on("guildDelete", guild => {
  getinvites();
});

var moe = {
  gc: function() {
    return client;
  }
};

for (var key in moe) {
  module.exports[key] = moe[key];
}

client.login(token);
