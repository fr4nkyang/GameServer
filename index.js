/**
 *   依赖导入
 */
var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var LogFactory = require('./logger');
var GameStore = require('./store/Game.js');
var users = require('./users.js');
var GameHandler = require('./handler/GameHandler.js');
var UserHandler = require('./handler/UserHandler');
var Excep = require('./BaseException');

// ------------------------------------------------------------------------------------------------------------

var port = 8091;
var log = LogFactory.getLogger('dateFileLog');
log.setLevel('DEBUG');

app.use(express.static(path.join(__dirname, "public")));

// ------------------------------------------------------------------------------------------------------------

var game = new GameStore.Game();

io.on('connection', function(socket) {
    log.info('new connection made');

    // 绑定比赛消息相关的处理handler
    GameHandler.initGameHandler(socket, game);
    UserHandler.initUserHandler(socket, game);

    // When new socket joins
    socket.on('join', function(data) {

        socket.nickname = data.nickname;
        // users[socket.nickname] = socket;
        var userObj = {
            nickname: data.nickname,
            socketid: socket.id,
            phoneNo: data.phoneNo
        };
        users.addUser(userObj);

        log.debug('新用户加入, '+JSON.stringify(userObj));

    });

    /**
     *  用户尝试获取多人比赛信息
     *  如果比赛不存在，返回比赛为空的消息；
     *  如果比赛存在，广播比赛倒计时；
     *  如果比赛结束，返回比赛结束消息；
     */
    socket.on('getMatchInfo', function (data) {
            socket.emit('retMatchInfo', match);
    });

    /**
     *  用户加入比赛
     */
    socket.on('joinMatch', function (data) {

    });


    // Join private room
    socket.on('join-private', function(data) {
        socket.join('private');
        console.log(data.nickname + ' joined private');
    });

    socket.on('private-chat', function(data) {
        socket.broadcast.to('private').emit('show-message', data.message);
    });

    // Show all users when first logged on
    socket.on('get-users', function(data) {
        socket.emit('all-users', users);
    });



    // Send a message
    socket.on('send-message', function(data) {
        // socket.broadcast.emit('message-received', data);
        io.emit('message-received', data);
    });

    // Send a 'like' to the user of your choice
    socket.on('send-like', function(data) {
        console.log(data);
        console.log(data.like);
        console.log(data.from);
        socket.broadcast.to(data.like).emit('user-liked', data);
    });

    socket.on('disconnect', function() {
        // users = users.filter(function(item) {
        //     return item.nickname !== socket.nickname;
        // });
        io.emit('all-users', users);
    });

});

server.listen(port, function() {
    log.info("Listening on port " + port);
});