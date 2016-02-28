var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');
var mongo = require('mongodb').MongoClient;

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

mongo.connect('mongodb://sheff:123@ds019078.mlab.com:19078/chat', function(err, db) {
	if (err) {
		throw err;
	}
	// Sends current users to provided socket
	function sendCurrentUsers (socket) {
		var info = clientInfo[socket.id];
		var users = [];

		if (typeof info === 'undefined') {
			return;
		}

		Object.keys(clientInfo).forEach(function(socketId) {
			var userInfo = clientInfo[socketId];

			if (info.room === userInfo.room) {
				users.push(userInfo.name);
			}
		});

		socket.emit('message', {
			name: 'System',
			text: 'Current users: ' + users.join(', '),
			timestamp: moment().valueOf()
		});
	}

	io.on('connection', function(socket) {
		var chat = db.collection('chats');
		console.log('user connected via socket.io');
		chat.find().limit(100).sort({_id:1}).toArray(function(err, res) {
			if (err) {
				throw err
			}

		});

		socket.on('disconnect', function() {
			var userData = clientInfo[socket.id];
			if (typeof clientInfo[socket.id] !== 'undefined') {
				socket.leave(userData.room);
				io.to(userData.room).emit('message', {
					name: 'System',
					text: userData.name + ' has left.',
					timestamp: moment().valueOf()
				});
				delete clientInfo[socket.id];
			}
		});

		//Database

		socket.on('input', function(data) {
			var name = data.name;
			var message = data.message;

			if (name === '' || message === '') {
				console.log('Please enter user and message');
			} else {
				chat.insert({name: name, message: message}, function() {
					console.log('info saved');
				})
			}
		});

		socket.on('clear', function(data) {
			chat.remove({}, function() {
				console.log('info cleared');
			});
		});

		socket.on('joinRoom', function(req) {
			clientInfo[socket.id] = req;
			socket.join(req.room);
			socket.broadcast.to(req.room).emit('message', {
				name: 'System',
				text: req.name + ' has joined!',
				timestamp: moment().valueOf()
			});
		});

		socket.on('message', function(message) {
			console.log('message recieved ' + message);
		// io.emit('message', message);
		if (message.text === '@currentUsers') {
			sendCurrentUsers(socket);
		} else {
			//timestamp property to be emitted
			var userName = message.name;
			var userMessage = message.text;
			var userRoom = clientInfo[socket.id].room;

			if (userName === '' || userMessage === '') {
				console.log('Please enter user and message');
			} else {
				chat.insert({name: userName, message: userMessage, room: userRoom}, function() {
					console.log('info saved');
				})
			};
			message.timestamp = moment().valueOf();
			io.to(clientInfo[socket.id].room).emit('message', message);
		}
	});

		socket.emit('message', {
			name: 'System',
			text: "Welcome to the chat application.",
			timestamp: moment().valueOf()
		});
	});
});

http.listen(PORT, function() {
	console.log('Server started on port ' + PORT);
});