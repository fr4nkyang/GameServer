var matchInfo = require('./Game');
var logFactory = require('./logger');

// ------------------------------------------------------------------------------------------------------------

var log = logFactory.getLogger('file');

// ------------------------------------------------------------------------------------------------------------


/**
 * 初始化游戏管理的消息处理器
 * @param socket
 */
exports.initGameHandler = function (socket) {

    socket.on('createMatch', function (data) {
        log.debug('Get CREATE Match request');
        log.debug(JSON.stringify(data));
        if (data != null) {
            var startTime = data.startTime;
            var isStop = data.isStop;
            var nowTime = Date.now();
            var count = Math.floor((startTime - nowTime) / 1000);
            matchInfo.setMatch(data);
            log.debug('设定的比赛信息：'+ JSON.stringify(matchInfo.getMatch()));

            log.debug('Count down is ' + count);
            // 比赛开始时间已经落后了
            if (count < 0) {

                log.debug("游戏开始时间已经落后啦！");

            } else {
                var intervalObj = setInterval(function () {
                    log.debug('Count down is ' + count);
                    if (count--) {
                        socket.emit('countDown', {"countDown": count});
                    } else {
                        log.debug('game begins');
                        socket.emit('gameBegins', "Game start!");
                        clearInterval(intervalObj);
                    }
                }, 1000);
            }
            log.debug('create a new match');
        }
    });

    socket.on('getMatch', function (data) {
        log.debug('Some one ask Match Info:'+ JSON.stringify(matchInfo.getMatch()));
        socket.emit('getMatchSuccess', matchInfo.getMatch());
    });

    socket.on('stopMatch', function (data) {
        log.debug('Get STOP Match request');
        if (data != null) {
            matchInfo.setMatch(data);
            socket.broadcast.emit('gameStoped', data);
        }
    });
}

