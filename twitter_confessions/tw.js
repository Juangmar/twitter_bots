/*
*
*	Copyright (c) 2018 Juan Gómez-Martinho
*	MIT License
*
*	https://github.com/Juangmar
*
*/

var Twit = require('twit') //Load the twitter API
var T = new Twit({
	//Our app credentials. Obtained at https://apps.twitter.com/
	consumer_key: '***',
	consumer_secret: '***',
	access_token: '***',
	access_token_secret: '***',
})

var stream = T.stream('user'); //Variable that stores the user stream.

console.log("Booting up...... success!"); //initial message. Shows that the program is executing.
console.log("Now listening twitter MD's............"); //Proceed to stream on the user's DMs

//Opens the stram on 'direct_message', executing the following function with the directMsg variable as param.
stream.on('direct_message', function (directMsg) {
	console.log("======= MD recibido! ======="); //Log that a DM is detected.
	console.log(directMsg.direct_message.sender_screen_name); //Show the user that sends it.
	console.log(directMsg.direct_message.created_at); //Show the date of the msg.
	var text = 	directMsg.direct_message.text; //Store the MD text
	console.log(text); //Show the MD text.
	console.log("Publicando..."); //Proceed to post the text.
	T.post('statuses/update', {status: text}, function(err,data,response){
		console.log("Posted at: "+ data.created_at); //show the time the tweet is posted.
		/*
			WARNING: IN THE NEXT VERSION THIS FUNCTION WILL HAVE AN IF-ELSE
			TO PRINT THE SUCCESS OR THE ERROR.
		*/
	})
	
})