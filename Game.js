var Match = require('./Match');
var _ = require('lodash');


// ------------------------------------------------------------------------------------------------------------

// 历史游戏记录
var GameList = [];

var match = null;

exports.getMatch = function () {
    return match;
}

exports.setMatch = function (data) {
    if (_.isNil(data))
        match = data;
};





