var socket = require('socket.io-client')('http://localhost:8091');

socket.on('connect', function () {
    console.log('Connect success!');
    console.log('Socket id:' + socket.id);

});

socket.on('countDown', function (data) {

    console.log('The Game will begin in ' + data.countDown + ' seconds!');

});

socket.on('exception', function (data) {
    console.log('出现错误：'+ JSON.stringify(data));
});

socket.on('loginSuccess', function (data) {
    console.log(data);
});
socket.on('getUserSuccess', function (data) {
    console.log('getUserSuccess');
    console.log(data);
});
socket.on('getAllUserSuccess', function (data) {
    console.log('getAllUserSuccess');
    console.log(data);
});


function main() {
    var user = {
        'userName': 'frank'
    };
    console.log(JSON.stringify(user));

    socket.emit('getUser', user);
    socket.emit('getAllUser');
}

main();