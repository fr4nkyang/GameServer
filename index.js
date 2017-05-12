var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var LogFactory = require('./logger');
var GameStore = require('./store/Game.js');
var GameHandler = require('./handler/GameHandler.js');
var UserHandler = require('./handler/UserHandler');

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
        // io.emit('all-users', users);
        log.debug("有人下线……");
    });

});

server.listen(port, function() {
    log.info("Listening on port " + port);
});