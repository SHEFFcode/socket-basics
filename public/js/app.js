var name = getQueryVariable('name') || 'Anonymous';
var room = getQueryVariable('room');
var socket = io();

console.log(name + ' wants to join ' + room);

$('.room-title').text(room);

socket.on('connect', function() {
	console.log('connected');
	socket.emit('joinRoom', {
		name: name,
		room: room
	});
	
});

socket.on('message', function(message) {
	var momentTimestamp = moment.utc(message.timestamp);
	var $messages = $('.messages');
	var $message = $('<li class="list-group-item"></li>');
	console.log(message.text);

	$message.append('<p><strong>' + message.name + ' ' + momentTimestamp.local().format('h:mm a') + '</p></strong>');
	$message.append('<p>' + message.text + '</p>');
	$messages.append($message);
});

//Handles submitting of new message
var $form = $('#message-form');

$form.on('submit', function(e) {
	e.preventDefault();
	socket.emit('message', {
		name: name, 
		text: $form.find('input[name=message]').val()
	});
	$form.find('input[name=message]').val('');
});