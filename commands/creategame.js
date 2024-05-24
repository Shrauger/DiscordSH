const { errorMessage, shuffleArray } = require("../message-helpers");

async function execute(message, args, user) {
  const channels = await game_info.get("game_channels");
  if (!(message.channel.id in channels)) {
    let playerCount;
    let monarchist = false;
    let avalon = false;
    let percy = false;

    // Check for arguments and gamemodes (case-insensitive)
    if (args && args.length > 0) {
      if (args.map((e) => e.toLowerCase()).includes("monarchist")) monarchist = true;
      if (args.map((e) => e.toLowerCase()).includes("avalon")) {
        avalon = true;
        if (args.map((e) => e.toLowerCase()).includes("percival")) percy = true;
      }
      playerCount = parseInt(args.find(num => parseInt(num) >= 5 && parseInt(num) <= 10));
    } else {
      // If no player count is specified, prompt the user to provide it
      message.channel.send(errorMessage("Please specify the number of players (between 5 and 10)."));
      return;
    }

    if (isNaN(playerCount) || playerCount < 5 || playerCount > 10) {
      message.channel.send(errorMessage("Invalid player count. Please specify a number between 5 and 10."));
      return;
    }

    let powers;
    if (playerCount === 5 || playerCount === 6) {
      powers = [null, null, "peek", "bullet", "bullet"];
    } else if (playerCount === 9 || playerCount === 10) {
      powers = ["investigate", "investigate", "election", "bullet", "bullet"];
    } else if (playerCount === 7 || playerCount === 8) {
      powers = [null, "investigate", "election", "bullet", "bullet"];
    }

    const game_id = message.channel.id.toString() + "_" + Date.now().toString();
    channels[message.channel.id] = game_id;
    const game_data = {
      customGameSettings: {
        deckState: { lib: 6, fas: 11 },
        trackState: { lib: 0, fas: 0 },
        powers: powers,
        enabled: false,
        hitlerZone: 3,
        vetoZone: 5,
        fascistCount: Math.floor((playerCount - 1) / 2),
        hitKnowsFas: playerCount < 7,
        monarchist: monarchist,
        avalon: avalon,
      },
      date: new Date(),
      gameSetting: {
        rebalance6p: false,
        rebalance7p: false,
        rebalance9p: false,
        rerebalance9p: false,
        casualGame: true,
        practiceGame: false,
        unlistedGame: false,
        avalonSH: avalon ? { withPercival: percy } : null,
        noTopdecking: 0,
      },
      players: [],
      logs: [],
      playerCount: playerCount,
      player_ids: {},
      game_id: game_id,
      guild_id: message.guild.id,
      channel_id: message.channel.id,
      gameState: {
        lib: 0,
        fas: 0,
        failedGovs: 0,
        specialElected: -1,
        deck: shuffleArray([
          "R", "R", "R", "R",
          "R", "R", "R", "R",
          "R", "R", "R", "B",
          "B", "B", "B", "B",
          "B",
        ]),
        discard: [],
        presidentId: -1,
        chancellorId: -1,
        lastPresidentId: -1,
        lastChancellorId: -1,
        presidentHand: [],
        chancellorHand: [],
        votes: Array(playerCount).fill(null),
        presidentVeto: null,
        chancellorVeto: null,
        phase: "joinWait",
        deadPlayers: [],
        invPlayers: [],
        topDecks: 0,
        hitlerElected: false,
        hitlerDead: false,
        assassinatedPlayer: -1,
        log: {},
      },
    };
    await game_info.set("game_channels", channels);
    await game_info.set(game_id, game_data);

    let gameModeMessage;
    const percyMessage = percy ? " with Percival" : "";
    if (monarchist && avalon) {
      gameModeMessage = ` Monarchist and Avalon${percyMessage} modes enabled.`;
    } else if (monarchist) {
      gameModeMessage = " Monarchist mode enabled.";
    } else if (avalon) {
      gameModeMessage = ` Avalon${percyMessage} mode enabled.`;
    } else {
      gameModeMessage = " Vanilla Secret Hitler mode enabled.";
    }

    message.channel.send(`Game created for ${playerCount} players!${gameModeMessage}`);
  } else {
    message.channel.send(errorMessage("A game already exists in this channel!"));
  }
}

module.exports = {
  name: "creategame",
  aliases: [],
  execute,
};
