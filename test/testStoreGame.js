var GameStore = require("../store/Game");
var ModelMatch = require("../model/Match");
var ModelMatchResult = require("../model/MatchResult");
var ModelUser = require("../model/User");
var Logger = require('../logger');

var log = Logger.getLogger('dateFileLog');
log.setLevel('DEBUG');

var user = new ModelUser.User("frank", "15021121315");
var match = new ModelMatch.Match(null,  "新比赛1", Date.now(),Date.now()+6000);
var matchResult = new ModelMatchResult.MatchResult(match.matchId, user.userName, 100);

log.debug("--------- user model ----------");
log.debug(user);
log.debug(match);
log.debug(matchResult);


log.debug("--------- create game ----------");

var game = new GameStore.Game();
game.setMatch(match);
game.addUser(user);
game.joinGame(user);


log.debug(game);

log.debug("--------- set matchResult ----------");

game.savePlayerMatchResult(matchResult);

log.debug(game);



