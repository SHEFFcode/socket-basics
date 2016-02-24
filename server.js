var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
	console.log('user connected via socket.io');

	socket.on('message', function(message) {
		console.log('message recieved ' + message.text);
		io.emit('message', message);
			//timestamp property to be emitted
			message.timestamp = moment().valueOf();
		});

	socket.emit('message', {
		name: 'System',
		text: "Welcome to the chat application.",
		timestamp: moment().valueOf()
	});
});

http.listen(PORT, function() {
	console.log('Server started!');
});