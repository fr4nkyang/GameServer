var logFactory = require("./../logger");
var _ = require("lodash");
var Match = require("./../model/Match");

// ------------------------------------------------------------------------------------------------------------

var log = logFactory.getLogger("file");

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
            var isStop = data.isStop;
            var nowTime = Date.now();
            var count = Math.floor((startTime - nowTime) / 1000);

            var curMatch = new Match.Match(null, startTime, data.name);
            game.setMatch(curMatch);

            log.debug("设定的比赛信息：" + JSON.stringify(game.getMatch()));
            log.debug("倒计时" + count);
            // 比赛开始时间已经落后了
            if (count < 0) {

                log.debug("游戏开始时间已经落后啦！");

            } else {
                var intervalObj = setInterval(function () {
                    log.debug("倒计时 " + count);
                    if (count--) {
                        socket.emit("countDown", {"countDown": count});
                    } else {
                        log.debug("开始比赛！");
                        socket.emit("gameBegins", "开始比赛!");
                        clearInterval(intervalObj);
                    }
                }, 1000);
            }
            log.debug("创建了新比赛");
        }
    });

    socket.on("getMatch", function (data) {
        log.debug("Some one ask Match Info:" + JSON.stringify(game.getMatch()));
        socket.emit("getMatchSuccess", game.getMatch());
    });

    socket.on("stopMatch", function (data) {
        log.debug("Get STOP Match request");
        if (data != null) {
            game.setMatch(data);
            socket.broadcast.emit("gameStoped", data);
        }
    });


    // 用户加入比赛请求
    socket.on("joinMatch", function (data) {
        var match = game.getMatch();
        if (_.isNil(match)) {
            log.error("没有比赛可以加入");
            socket.emit("exception", {"name": "JoinMatchException", "message": "没有比赛可以加入"});
        } else {
            match.joinMatch(data);
            // TODO 加入私聊channel
        }
    });

    // 用户请求查询比赛结果
    socket.on("queryMatchResult", function (data) {
        // TODO 传递参数，查询当前以及历史的比赛结果
    });

    // 用户请求查询比赛结果
    socket.on("getMatchResultById", function (data) {
        if (_.isNil(data)) {
            log.error("查询比赛信息失败：输入信息无效！");
            socket.emit("exception", {"name": "GetMatchResultException", "message": "没有比赛可以加入"});
        }
    });
}

