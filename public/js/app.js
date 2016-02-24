var socket = io();

socket.on('connect', function() {
	console.log('connected');
});

socket.on('message', function(message) {
	var momentTimestamp = moment.utc(message.timestamp);
	console.log(message.text);
	$('.messages').append('<p><strong>' + momentTimestamp.local().format('h:mm a') + ': </strong>' + message.text + '</p>');
});

//Handles submitting of new message
var $form = $('#message-form');

$form.on('submit', function(e) {
	e.preventDefault();
	socket.emit('message', {
		text: $form.find('input[name=message]').val()
	});
	$form.find('input[name=message]').val('');
});