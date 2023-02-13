const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http:/localhost:3000");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//Get all PlayerList With Details//
app.get("/players/", async (request, response) => {
  const listOfAllPlayers = `
    SELECT * 
    FROM player_details`;
  const allPlayerArray = await db.all(listOfAllPlayers);

  /*Convert this database object into the response 
  object by the function convertDbObjectToResponseObject*/
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
    };
  };

  /*With the above function convertDbObjectToResponseObject, 
  we got the responsive object into the camelCase.*/
  let camelCaseArray = [];
  let camelCaseOutput = allPlayerArray.map((each) =>
    camelCaseArray.push(convertDbObjectToResponseObject(each))
  );
  response.send(camelCaseArray);
});

//Get any single player(provided by player_id) detail//
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * FROM player_details
    WHERE player_id=${playerId}`;
  const player = await db.get(getPlayerQuery);

  let camelCasePlayer = {
    playerId: player.player_id,
    playerName: player.player_name,
  };
  response.send(camelCasePlayer);
});

//Updates player details in the team(database) based on player ID//
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetail = request.body;
  const { playerName } = playerDetail;
  console.log(playerDetail);
  const updatePlayerQuery = `
    UPDATE player_details
    SET 
        player_name = '${playerName}'
    WHERE player_id=${playerId}
    `;
  const updatedPlayer = await db.run(updatePlayerQuery);
  console.log(updatedPlayer);
  response.send("Player Details Updated");
});

//Get all PlayerList With Details//
app.get("/players/", async (request, response) => {
  const listOfAllPlayers = `
    SELECT * 
    FROM player_details`;
  const allPlayerArray = await db.all(listOfAllPlayers);

  /*Convert this database object into the response 
  object by the function convertDbObjectToResponseObject*/
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
    };
  };

  /*With the above function convertDbObjectToResponseObject, 
  we got the responsive object into the camelCase.*/
  let camelCaseArray = [];
  let camelCaseOutput = allPlayerArray.map((each) =>
    camelCaseArray.push(convertDbObjectToResponseObject(each))
  );
  response.send(camelCaseArray);
});

//Returns the match details of a specific matc//
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchDetailQuery = `
    SELECT * FROM match_details
    WHERE match_id=${matchId}`;
  const matchDetail = await db.get(matchDetailQuery);

  let camelCaseMatch = {
    matchId: matchDetail.match_id,
    match: matchDetail.match,
    year: matchDetail.year,
  };
  response.send(camelCaseMatch);
});

//Returns a list of all the matches of a player//
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const playerMatchDetailQuery = `
    SELECT * FROM player_match_score NATURAL JOIN match_details
    WHERE player_id=${playerId}`;
  const playerMatchDetail = await db.all(playerMatchDetailQuery);
  console.log(playerMatchDetail);

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      matchId: dbObject.match_id,
      match: dbObject.match,
      year: dbObject.year,
    };
  };

  /*With the above function convertDbObjectToResponseObject, 
  we got the responsive object into the camelCase.*/
  let camelCaseArray = [];
  let camelCaseOutput = playerMatchDetail.map((each) =>
    camelCaseArray.push(convertDbObjectToResponseObject(each))
  );
  response.send(camelCaseArray);
});

//Returns a list of all the matches of a player//
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const matchPlayerDetailQuery = `
    SELECT * FROM player_match_score NATURAL JOIN player_details
    WHERE match_id=${matchId}`;
  const matchPlayerDetail = await db.all(matchPlayerDetailQuery);
  console.log(matchPlayerDetail);

  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
    };
  };

  /*With the above function convertDbObjectToResponseObject, 
  we got the responsive object into the camelCase.*/
  let camelCaseArray = [];
  let camelCaseOutput = matchPlayerDetail.map((each) =>
    camelCaseArray.push(convertDbObjectToResponseObject(each))
  );
  response.send(camelCaseArray);
});

/*Return the statistics of the total score, total fours, 
total sixes of a specific player based on the player ID*/
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const playerStatisticsQuery = `
    SELECT 
        player_id as playerId,
        player_name as playerName,
        SUM(score) as totalScore,
        SUM(fours) as totalFours,
        SUM(sixes) as totalSixes
    FROM player_match_score NATURAL JOIN player_details
    WHERE player_id=${playerId}`;
  const playerStatistics = await db.get(playerStatisticsQuery);
  console.log(playerStatistics);
  response.send(playerStatistics);
});
module.exports = app;
