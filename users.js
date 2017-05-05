var users = [];

exports.getUsers = function() {
    return users;
}

exports.setUsers = function (data) {
    users = data;
}

exports.addUser = function (data) {
    users.push(data);
}