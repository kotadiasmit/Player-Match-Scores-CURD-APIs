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
module.exports = app;
