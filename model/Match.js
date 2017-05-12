var uuid = require("uuid/v4");
var _ = require("lodash");
var Excep = require('./../BaseException');
var DateFormat = require("../lib/dateFormat");



function Match(id, matchName, stime, endtime) {
    if (_.isNil(id))
        this.matchId = uuid();
    else
        this.matchId = id;
    this.startTime = stime;
    this.startTimeString = DateFormat.formatTimestamp(this.startTime);
    this.endTime = endtime;
    this.matchName = matchName;
    this.isRunning = false;
    this.userList = [];
}

Match.prototype.joinGame = function (user) {

    if (_.isNil(user))
        throw new Excep.BaseException("MatchException", "加入比赛失败：用户信息不全");
    else {
        var ind = _.findIndex(this.userList, function (o) {
            return o.userName == user;
        });
        if (-1 == ind) {
            this.userList.push(user);
        }
    }
}

/**
 *   从比赛中移除用户
 *   @param user 用户
 */
Match.prototype.quitGame = function (user) {

    if (_.isNil(user))
        throw new Excep.BaseException("MatchException", "加入比赛失败：用户信息不全");
    else {
        this.userList = _.remove(this.userList, function (o) {
            return o == user.userName;
        });
    }

}

exports.Match = Match;