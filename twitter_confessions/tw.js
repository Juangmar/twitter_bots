var Twit = require('twit')
var T = new Twit({
	consumer_key: '***',
	consumer_secret: '***',
	access_token: '***',
	access_token_secret: '***',
})

var stream = T.stream('user');

console.log("Booting up...... success!");
console.log("Now listening twitter MD's............");

stream.on('direct_message', function (directMsg) {
	console.log("======= MD recibido! =======");
	console.log(directMsg.direct_message.sender_screen_name);
	console.log(directMsg.direct_message.created_at);
	var text = 	directMsg.direct_message.text;
	console.log(text);
	console.log("Publicando...");
	T.post('statuses/update', {status: text}, function(err,data,response){
		console.log("Posted at: "+ data.created_at);	
	})
	
})