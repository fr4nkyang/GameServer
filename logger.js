var log4js = require('log4js');

log4js.configure({
    appenders: [
        { type: 'console' }, //控制台输出
        {
            type: 'file', //文件输出
            filename: 'logs/access',
            pattern: '.yyyy-MM-dd.log',
            maxLogSize: 1024,
            backups:3,
            category: 'dateFileLog'
        }
    ],
    replaceConsole: true
});

log4js.setGlobalLogLevel(log4js.levels.ALL);

function getLogger(file) {
     return  log4js.getLogger(file || 'dateFileLog');
}

function setLevel(level) {
    return log4js.setGlobalLogLevel(level || log4js.levels.ALL);
}


module.exports = {
    getLogger: getLogger,
    setLevel: setLevel
};