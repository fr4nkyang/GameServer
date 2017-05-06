var matchInfo = require('./../store/Game');
var LogFactory = require('./../logger');
var _ = require('lodash');
var Excep = require('./../BaseException');

// ------------------------------------------------------------------------------------------------------------

var log = LogFactory.getLogger('dateFileLog');
log.setLevel('DEBUG');

// ------------------------------------------------------------------------------------------------------------


function userCheck(data) {

    if (!_.isNil(data)) {
        if (_.isNil(data.phone) || "" === _.trim(data.phone)) {
            throw new Excep.BaseException('UserException', '手机号无效！');
        }
        if (_.isString(data.phone) && data.phone.length != 11) {
            throw new Excep.BaseException('UserException', '手机号无效！');
        }
        if (_.isNil(data.userName) || "" === _.trim(data.userName)) {
            // 用户名没有输入，则默认是手机号
            data.userName = data.phone;
        }
        if (_.isString(data.userName) && data.userName.length < 6) {
            throw new Excep.BaseException('UserException', '用户名太短！');
        }

        return true;
    } else {
        throw new Excep.BaseException('UserException', '输入信息无效！');
    }

}

function reqUserParamCheck(data) {
    if (!_.isNil(data)) {
        if (_.isNil(data.userName)) {
            throw new Excep.BaseException('ParamException', '输入请求参数用户名无效！');
        }
        return true;
    } else {
        throw new Excep.BaseException('ParamException', '输入请求参数无效！');
    }
}


/**
 * 初始化游戏管理的消息处理器
 * @param socket
 */
exports.initUserHandler = function (socket, game) {

    socket.on('register', function (data) {
        log.debug('Get REGISTER request');
        log.debug(JSON.stringify(data));

        try {
            if (userCheck(data)) {
                var curUsers = game.getUsers();
                var isIn = _.find(curUsers, function (o) {
                    if (o.userName == data.userName || o.phone == data.phone) {
                        return true;
                    }
                });
                if (_.isNil(isIn)) {
                    // 没有被注册，加入数据库／缓存
                    game.addUser(data);
                    socket.emit('registerSuccess', data);
                } else {
                    throw new Excep.BaseException('RegisterException', '该用户信息已经注册过！');
                }

            }
        } catch (err) {
            log.error('出现错误：' + err.message);
            socket.emit('exception', {"name": err.name, "message": err.message});
        }

    });


    socket.on('login', function (data) {
        log.debug('Get LOGIN request');
        log.debug(JSON.stringify(data));

        try {
            if (userCheck(data)) {
                var curUsers = game.getUsers();
                var isIn = _.find(curUsers, function (o) {
                    if (o.userName == data.userName && o.phone == data.phone) {
                        return true;
                    }
                });
                if (_.isNil(isIn)) {
                    throw new Excep.BaseException('LoginException', '登陆失败，用户名或密码错误！');
                } else {
                    socket.emit('loginSuccess', curUsers);
                }

            }
        } catch (err) {
            log.error('出现错误：' + err.message);
            socket.emit('exception', {"name": err.name, "message": err.message});
        }

    });

    socket.on('getUser', function (data) {

        log.debug('Get GET_USER request');
        log.debug(JSON.stringify(data));

        try {
            if (reqUserParamCheck(data)) {
                var curUsers = game.getUsers();
                var isIn = _.find(curUsers, function (o) {
                    if (o.userName == data.userName) {
                        return true;
                    }
                });
                if (_.isNil(isIn)) {
                    socket.emit('getUserSuccess', null);
                } else {
                    socket.emit('getUserSuccess', isIn);
                }

            }
        } catch (err) {
            log.error('出现错误：' + err.message);
            socket.emit('exception', {"name": err.name, "message": err.message});
        }

    });

    socket.on('getAllUser', function (data) {

        log.debug('Get GET_ALL_USER request');
        log.debug(JSON.stringify(data));

        var curUsers = game.getUsers();
        if (_.isNil(curUsers)) {
            socket.emit('getAllUserSuccess', null);
        } else {
            socket.emit('getAllUserSuccess', curUsers);
        }
    });


}