var _ = require("lodash");

var arr = ["123123123"];

console.log(_.indexOf(arr, "123123123"));


// var sleep = require('sleep');
// var nowTime = Date.now();


// console.log('now Time:' + nowTime);
//
// sleep.sleep(1);
//
// var afterTime = Date.now();
// console.log('now Time:' + afterTime);
//
// var cnt = 3;
//
// var intervalObj = setInterval(function () {
//         if ( cnt --) {
//             console.log('interviewing the interval');
//         } else {
//             console.log('Stop!');
//             clearInterval(intervalObj);
//         }
// }, 500);