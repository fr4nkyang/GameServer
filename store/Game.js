var _ = require("lodash");
var Excep = require("./../BaseException");
var ModelMatch = require("./../model/Match");


// ------------------------------------------------------------------------------------------------------------


// 建立游戏的数据仓库，初始化的时候从db加载历史数据，并创建新的游戏记录；
// 游戏记录分为，游戏登陆用户信息 和 他们的结果信息，结果信息会随时间而改变

function Game() {
    // 历史游戏记录
    this.gameResultList = [];
    // 当前比赛
    this.match = null;
    // 登录的用户
    this.users = [];
}

Game.prototype.getGameResult = function (matchId) {

    if (_.isNil(matchId)) {
        throw new Excep.BaseException("GameResultException", "输入matchId参数无效！");
    }
    return _.find(this.gameResultList, function (o) {
        return o.matchId == matchId;
    });
}

Game.prototype.getAllGameResults = function () {
    return this.gameResultList;
}


Game.prototype.setMatchResultList = function (list) {
    this.gameResultList = list;
}

Game.prototype.setMatchResult = function (result) {
    if (_.isNil(result) || _.isNil(result.matchId)) {
        throw new Excep.BaseException("GameResultException", "输入参数无效！");
    }
    var res = _.findIndex(this.gameResultList, function (o) {
        return o.matchId == result.matchId;
    });

    if (-1 == res) {
        this.gameResultList.push(result);
    } else {
        this.gameResultList[res] = result;
    }
}


Game.prototype.getMatch = function () {
    return this.match;
}

Game.prototype.setMatch = function (data) {
    if (!_.isNil(data))
        this.match = data;
};

/**
 * 用户加入比赛
 * @param user 用户user
 */
Game.prototype.joinGame = function (user) {
    if (_.isNil(user)) {
        throw new Excep.BaseException("JoinGameException", "用户加入比赛失败：用户信息无效！");
    }
    if (_.isNil(this.match) || !("joinGame" in this.match)) {
        throw new Excep.BaseException("JoinGameException", "用户加入比赛失败：比赛信息无效！");
    }

    var ind = _.findIndex(this.users, function (o) {
        return o.userName == user.userName;
    });

    if (ind == -1) {
        throw new Excep.BaseException("JoinGameException", "用户加入比赛失败：用户没有登陆！");
    } else {
        this.match.joinGame(user.userName);
    }

}


/**
 * 用户退出比赛
 * @param user 用户的用户名userName
 */
Game.prototype.quitGame = function (user) {
    if (_.isNil(user)) {
        throw new Excep.BaseException("QuitGameException", "用户退出比赛失败：用户信息无效！");
    }
    if (_.isNil(this.match) || !this.match.hasOwnProperty("quitGame")) {
        throw new Excep.BaseException("QuitGameException", "用户退出比赛失败：比赛信息无效！");
    }
    this.users = _.remove(this.users, function (o) {
        return o == user;
    });
    this.match.quitGame(user);

}


/**
 *
 */
Game.prototype.getUsers = function () {
    return this.users;
}

Game.prototype.addUser = function (user) {
    this.users.push(user);
}

exports.Game = Game;






