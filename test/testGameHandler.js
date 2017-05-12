var LogFactory = require('../logger');
var socket = require('socket.io-client')('http://localhost:8091');
var sleep = require('sleep');

var GameStore = require("../store/Game");
var ModelMatch = require("../model/Match");
var ModelMatchResult = require("../model/MatchResult");
var ModelUser = require("../model/User");

// ------------------------------------------------------------------------------------------------------------

var log = LogFactory.getLogger('dateFileLog');
log.setLevel('DEBUG');


// ------------------------------------------------------------------------------------------------------------
//          测试用例
// ------------------------------------------------------------------------------------------------------------


// 创建用户
var user1 = new ModelUser.User("frank1", "15021120001");
var user2 = new ModelUser.User("frank2", "15021120002");
var user3 = new ModelUser.User("frank3", "15021120003");
var user4 = new ModelUser.User("frank4", "15021120004");

var match = null;


function test1(socket) {
    socket.emit('register', user1);
    socket.emit('register', user2);   // 应该报错，重复用户
    socket.emit('register', user3);
    socket.emit('register', user4);   // 应该报错，重复用户

    socket.emit('getAllUser', null);  // 尝试获取所有用户
    // 用户登陆
    socket.emit('login', user1);
    socket.emit('login', user2);
    socket.emit('login', user3);
    socket.emit('login', user4);
}



function test2(socket) {

    log.debug("创建比赛");
    // 创建游戏
    var nowTime = Date.now();  // the number of milliseconds elapsed
    var startTime = nowTime + 6000;
    var endTime = startTime + 60000;
    var period = 60000;
    match = {
        "startTime" : startTime,
        "endTime": endTime,
        "matchName": "测试比赛1",
        "period": period
    };
    log.debug("游戏6秒后开始");
    log.log(JSON.stringify(match));
    socket.emit('createMatch', match);

}


function test3(socket) {

    // 加入游戏
    socket.emit('joinGame', user1);
    socket.emit('joinGame', user2);
    socket.emit('joinGame', user3);
    socket.emit('joinGame', user4);

    socket.emit('getMatch');

    var matchResult1 = new ModelMatchResult.MatchResult(match.matchId, user1.userName, 1);
    var matchResult2 = new ModelMatchResult.MatchResult(match.matchId, user2.userName, 2);
    var matchResult3 = new ModelMatchResult.MatchResult(match.matchId, user3.userName, 3);
    var matchResult4 = new ModelMatchResult.MatchResult(match.matchId, user4.userName, 4);
    socket.emit('saveUserGameResult', matchResult1);
    socket.emit('saveUserGameResult', matchResult1);
    socket.emit('saveUserGameResult', matchResult1);
    socket.emit('saveUserGameResult', matchResult2);
    socket.emit('saveUserGameResult', matchResult3);
    socket.emit('saveUserGameResult', matchResult4);
    log.debug("停止比赛");
    socket.emit('stopMatch');
}




socket.on("getMatchSuccess", function (data) {
    log.debug("获取比赛结果成功："+ JSON.stringify(data));
});


socket.on("saveUserGameResultSuccess", function (data) {
    log.debug("存入结果成功："+ JSON.stringify(data));
});

socket.on("saveUserGameResultFail", function (data) {
    log.debug("存入结果失败："+ JSON.stringify(data));
});


socket.on("joinGameSuccess", function (data) {
    log.debug("加入游戏成功："+ JSON.stringify(data));
});

socket.on("joinGameFail", function (data) {
    log.debug("加入游戏失败："+ JSON.stringify(data));
});


socket.on("loginSuccess", function (data) {
    log.debug("登陆成功："+ JSON.stringify(data));
});


socket.on('getAllUserSuccess', function (data) {
    log.debug("获得所有用户信息成功："+ JSON.stringify(data));
});

socket.on('game-stop', function (data) {
    log.debug("游戏结束："+ JSON.stringify(data));
});

// ------------------------------------------------------------------------------------------------------------


socket.on('connect', function () {
    console.log('Connect success!');
    console.log('Socket id:' + socket.id);

    test1(socket);
    test2(socket);
    test3(socket);

});



// ------------------------------------------------------------------------------------------------------------


socket.on('getMatchSuccess', function (data) {

    console.log('获得比赛信息:'+ JSON.stringify(data));

});

socket.on('countDown', function (data) {

    console.log('The Game will begin in ' + data.countDown + ' seconds!');

});

socket.on('gameBegins', function (data) {
    console.log(data);
});


socket.on('exception', function (data) {
    log.warn(data.name + ":" + data.message);
});

socket.on('disconnect', function () {
    console.log('I am disconneting.');
});