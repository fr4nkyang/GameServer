var socket = require('socket.io-client')('http://localhost:8091');

socket.on('connect', function () {
    console.log('Connect success!');
    console.log('Socket id:' + socket.id);

    var nowTime = Date.now();
    var match = {
        'startTime': nowTime + 60000
    };
    console.log(JSON.stringify(match));
    // socket.emit('createMatch', match);
    socket.emit('getMatch', match);



});


socket.on('getMatchSuccess', function (data) {

    console.log('获得比赛信息:'+ JSON.stringify(data));

});

socket.on('countDown', function (data) {

    console.log('The Game will begin in ' + data.countDown + ' seconds!');

});

socket.on('gameBegins', function (data) {
    console.log(data);
});

socket.on('disconnect', function () {
    console.log('I am disconneting.');
});