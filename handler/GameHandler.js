var logFactory = require("./../logger");
var _ = require("lodash");
var ModelMatch = require("./../model/Match");
var Excep = require("../BaseException");
var DateFormat = require("../lib/dateFormat");

// ------------------------------------------------------------------------------------------------------------

var log = logFactory.getLogger("file");

// ------------------------------------------------------------------------------------------------------------

function checkGetMatchResultByIdParam(data) {

    if (_.isNil(data))
        throw new Excep.BaseException("ParamException", "输入参数无效（为Null）");
    if (!("matchId" in data) || (_.isNil(data.matchId)))
        throw new Excep.BaseException("ParamException", "参数matchId无效（为Null/undefined）");
    if (!("userName" in data) || (_.isNil(data.userName)))
        throw new Excep.BaseException("ParamException", "参数userName无效（为Null/undefined）");

    return true;
}


function stopCurGame(socket, game) {
    try {
        var data = game.stopGame();
        socket.emit("game-stop", data);
    } catch (err) {
        log.error(err.name + ":" + err.message);
        socket.emit("exception", err.name + ":" + err.message);
    }
}


function cleanCurGame(socket, game) {
    try {
        game.cleanGame();
        socket.emit("game-clean");
    } catch (err) {
        log.error(err.name + ":" + err.message);
        socket.emit("exception", err.name + ":" + err.message);
    }
}


// ------------------------------------------------------------------------------------------------------------


/**
 * 初始化游戏管理的消息处理器
 * @param socket
 */
exports.initGameHandler = function (socket, game) {

    socket.on("createMatch", function (data) {
        log.debug("Get CREATE Match request");
        log.debug(JSON.stringify(data));
        if (!_.isNil(data)) {
            var startTime = data.startTime;
            var nowTime = Date.now();
            var count = Math.floor((startTime - nowTime) / 1000);

            var curMatch = new ModelMatch.Match(null, data.matchName, data.startTime, data.endTime);
            curMatch.isRunning = true;

            game.setMatch(curMatch);
            log.debug("设定的比赛信息：" + JSON.stringify(game.getMatch()));
            log.debug("倒计时" + count);

            var period = 60000;

            if (_.isNil(data.period)) {
                period = data.period;
            }

            setTimeout(function () {
                log.debug("比赛自动结束，推送排名结果");
                stopCurGame(socket, game);
            }, period);

            // 比赛开始时间已经落后了
            if (count < 0) {

                log.debug("游戏开始时间已经落后啦！");
                socket.emit("gameBegins", "开始比赛!");

            } else {
                var intervalObj = setInterval(function () {
                    log.debug("倒计时 " + count);
                    if (count--) {
                        // socket.to("join-game").emit("countDown", {"countDown": count});
                        socket.emit("countDown", {"countDown": count});
                    } else {
                        log.debug("开始比赛！");
                        // socket.to("join-game").emit("gameBegins", "开始比赛!");
                        socket.emit("gameBegins", "开始比赛!");
                        clearInterval(intervalObj);
                    }
                }, 1000);

            }
            log.debug("创建了新比赛");
        } else {
            log.debug("创建游戏失败:输入比赛信息无效");
            socket.emit("exception", "创建游戏失败:输入比赛信息无效");
        }
    });

    socket.on("getMatch", function (data) {
        log.debug("Some one ask Match Info:" + JSON.stringify(game.getMatch()));

        var ret = game.getGameList();
        socket.emit("getMatchSuccess", ret);
    });

    socket.on("stopMatch", function (data) {
        log.debug("Get STOP Match request");
        stopCurGame(socket, game);
    });
    socket.on("cleanMatch", function (data) {
        log.debug("Get CLEAN Match request");
        cleanCurGame(socket, game);
    });


    // 用户加入比赛请求
    socket.on("joinGame", function (data) {
        try {
            game.joinGame(data);
            // 加入私聊channel
            // socket.join("join-game");
            // 告知客户端加入游戏成功
            socket.emit("joinGameSuccess", "加入多人游戏成功！");
            // socket.to("join-game").emit("joinGameSuccess", "加入多人游戏成功！");
        } catch (err) {
            log.error(err.name + ":" + err.message);
            socket.emit("joinGameFail", "加入多人游戏失败, " + err.message);
        }

    });


    // 用户保存临时结果
    socket.on("saveUserGameResult", function (data) {
        try {
            game.savePlayerMatchResult(data);
            socket.emit("saveUserGameResultSuccess", "savePlayerMatchResult 成功！");
        } catch (err) {
            log.error(err.name + ":" + err.message);
            socket.emit("saveUserGameResultFail", err.name + ":" + err.message);
        }

    });

    // 用户请求查询比赛结果
    socket.on("queryHistoryMatchs", function (data) {
        // TODO 传递参数，查询当前以及历史的比赛结果
        var histList = game.getAllGameResults();
        if (_.isNil(histList)) {
            histList = [];
        }
        socket.emit("queryHistoryMatchsSuccess", histList);

    });

    // 用户请求查询比赛结果
    socket.on("queryCurMatchResult", function (data) {
        try {
            checkGetMatchResultByIdParam(data);
        } catch (err) {
            log.error("查询比赛信息失败：[" + err.name + "] " + err.message);
            socket.emit("exception", {"name": err.name, "message": err.message});
        }

        // 处理服务器去完成
        var curRes = game.getCurMatchResultList();
        curRes = _.orderBy(curRes, ["result"], ["desc"]);

        log.debug("服务器获取到的【用户请求查询比赛结果】");
        log.debug(curRes);

        var ind = _.findIndex(curRes, function (o) {
            return o.userName == data.userName;
        });

        log.debug("用户" + data.userName);
        log.debug(data);
        log.debug("用户名次");
        log.debug(ind);
        var ret = null;

        if (ind != -1) {
            ret = {
                "index": ind,
                "result": curRes[ind].result
            };
        }

        socket.emit("queryCurMatchResultSuccess", ret);

    });
}

