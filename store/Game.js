var _ = require("lodash");
var Excep = require("./../BaseException");

// ------------------------------------------------------------------------------------------------------------


// 建立游戏的数据仓库，初始化的时候从db加载历史数据，并创建新的游戏记录；
// 游戏记录分为，游戏登陆用户信息 和 他们的结果信息，结果信息会随时间而改变

function Game() {
    // 历史游戏记录
    this.gameResultList = [];
    // 当前比赛
    this.match = null;
    this.matchResultList = [];
    // 登录的用户
    this.users = [];
}


// 停止游戏
// 将游戏结果统计并缓存
Game.prototype.stopGame = function () {

    if (_.isNil(this.match) || _.isNil(this.matchResultList) )
        throw new Excep.BaseException("stopGame", "无有效的比赛，停止失败！");

    // 按照成绩倒序排序
    this.matchResultList = _.orderBy(this.matchResultList, ["result"], ["desc"]);
    this.matchResultList = _.slice(this.matchResultList, 0, 10);

    var obj = {
        match: _.cloneDeep(this.match),
        matchResult: _.cloneDeep(this.matchResultList)
    };
    // 从加入比赛的列表中查询
    var ind = _.findIndex(this.gameResultList, function (o) {
        return o.match.matchId == this.match.matchId;
    }.bind(this));

    if (-1 == ind) {
        this.gameResultList.push(obj);
    } else {
        this.gameResultList[ind] = obj;
    }

    return obj;
}

Game.prototype.cleanGame = function() {
    this.match = null;
    this.matchResultList = [];
}

Game.prototype.getGameList = function () {

    var obj = {
        match: _.cloneDeep(this.match),
        matchResult: _.cloneDeep(this.matchResultList)
    };
    // var ret = _.concat(this.gameResultList, [obj]);
    return obj;
}

Game.prototype.savePlayerMatchResult = function (result) {
    if (!("userName" in result) || _.isNil(result.userName)) {
        throw new Excep.BaseException("addCurMatchResultException", "输入参数无效: userName无效！");
    }
    if (!("result" in result) || _.isNil(result.result)) {
        throw new Excep.BaseException("addCurMatchResultException", "输入参数无效: result无效！");
    }
    // 从加入比赛的用户列表中查询
    var ind = _.indexOf(this.match.userList, result.userName);
    if (-1 == ind) {
        throw new Excep.BaseException("addCurMatchResultException", "输入参数无效: 该user没有参加比赛！");
    } else {
        // 如果找的到，则添加或者更新结果
        var ind2 = _.findIndex(this.matchResultList, function(o) {
            return o.userName == result.userName;
        });
        if (-1 == ind2) {
            // 新增
            this.matchResultList.push(result);
        } else {
            // 更新
            this.matchResultList[ind2] = result;
        }
    }
}

Game.prototype.getGameResult = function (matchId) {
    if (_.isNil(matchId)) {
        throw new Excep.BaseException("GameResultException", "输入matchId参数无效！");
    }
    return _.find(this.gameResultList, function (o) {
        return o.match.matchId == matchId;
    });
}

Game.prototype.getAllGameResults = function () {
    return this.gameResultList;
}

Game.prototype.setMatchResultList = function (list) {
    this.gameResultList = list;
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

Game.prototype.getUsers = function () {
    return this.users;
}

Game.prototype.addUser = function (user) {
    this.users.push(user);
}


Game.prototype.getCurMatchResultList = function () {
    return this.matchResultList;
}

exports.Game = Game;






