// this will create a http server for me
var io = require('socket.io')(8091);

function chat() {
    var chatServer = io.of('/chat').on('connection', function (socket) {

        socket.broadcast.emit('Hello bitches, this is frank broadcasting...' );
        socket.emit('chat', 'this message is only in chat.');
        setInterval(function () {
            socket.emit('chat', 'this message is fucking chat all time.');
        }, 1000);
        socket.emit('news', 'Some news');

    });
}

exports.default = chat;

