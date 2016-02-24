var moment = require('moment');

var now = moment();

// now.subtract(1, 'Year');

console.log(now.format('X'));
console.log(now.format('x'));

var timestamp = 1456346969755;
var timeStampMoment = moment.utc(timestamp);

console.log(timeStampMoment.local().format('h:mma'));

// console.log(now.format('MMM Do h:mma'));