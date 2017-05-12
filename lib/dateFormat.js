var moment = require("moment");

exports.formatTimestamp = function (s) {
    return new moment(s).format("MM/DD-HH:mm:ss");
}