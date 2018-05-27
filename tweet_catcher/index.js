/*
*
*	Copyright (c) 2018 Juan Gómez-Martinho
*	MIT License
*
*	https://github.com/Juangmar
*
*/
var Twit = require('twit') //Loading twitter API
var fs = require("fs"); //IO module

var content = fs.readFileSync("user.json"); // IMPORTANT TO CREATE THIS FILE. This contains the user token info. 
var userData = JSON.parse(content); //parse the content of the file.
var T = new Twit({
	//Our app credentials. Obtained at https://apps.twitter.com/
	consumer_key: userData.consumer_key,
	consumer_secret: userData.consumer_secret,
	access_token: userData.access_token,
	access_token_secret: userData.access_token_secret,
})
var users; //Array of users IDs
var sec = 0; //Integer variable to count how many seconds it takes to get the users.
var followed = 0; // To store the number of rts done
var not_followed = 0; // Number of tweets detected
var title = " ---- TWEET CATCHER ----\n\n" // String containing the bot title
var lastEvent = ""; //To store the last event
var openDay = new Date(); //Get the day + hour the tweet is detected.
var openDate =  openDay.getFullYear() + '/' + (openDay.getMonth()+1) + '/' + openDay.getDate(); //String containing the date. Format "yyyy/mm/dd"
var openHour = + openDay.getHours() + ":" + openDay.getMinutes(); //String containig the hour. Format "HH:MM" 
var originalTime = openDate + " (" + openHour + ")"; //String containing first run time. Format "yyy/mmm/dd (hh:mm)"

console.log("Booting up...... success!"); //Initial message. The app is running.
console.log("The user data (from user.json) is:"); //Show the data obtained from the file.
console.log(T); // Twit info
console.log("Loading IDs..."); // Message: The loading of users begin.
checkVariable(); //Method to wait for the loading

var stream = T.stream('statuses/filter', {follow: users}); //Variable that stores the twitter timeline.

/*	This functions checks if the variable 'users' is defined. If not, stops 1s and checks again
*	No parameters, no return statement.
*/
function checkVariable() {
	if (users != undefined) { //If the variable is finally loaded
		process.stdout.write("IDs loaded after " + sec + " seconds! \n"); //Print how many seconds it took.
		stream = T.stream('statuses/filter', {follow: users}); //Replace the stream with the new user list.
		listen(); //Proceed to listen to the TL.
		checkUsers(); //Reimport users every 15min.
	} else{
		//The variable is not loaded yet.
		//Reemplazamble console message. Each time this line is called, the console line overrides.
		process.stdout.write("Downloading IDs. " + sec + " s...\r");  
		sec++; //Since the program will pause for 1 second, increment the sec variable 1 second (++)
		reloadUsers(); //Try again the reload
		setTimeout(checkVariable, 1000); //Wait for 1 second, then call for the check function again		
	}
}

/*
*	Starts the TL listening. It's the main function.
*/
function listen(){

	console.log("using the following users (" + users.length + "):"); 	// To check if the loading is correct, 
	console.log(users);													// the list is printed.
	console.log("Now listening twitter accounts............"); 			//The bot really starts now.
	
	//Stream. Each time a tweet is detected, execute the code below.
	stream.on('tweet', function (tweet) {
		try{
			var today = new Date(); //Get the day + hour the tweet is detected.
			var date =  today.getFullYear() + '_' + (today.getMonth()+1) + '_' + today.getDate(); //String containing the date. Format "yyyy-mm-dd"
			var filename = "log" + "\"" + date + ".txt"; //Log file name. It's in the log directory, with the name log\yyyy-mm-dd.txt
			var hour = "[ " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + " ] "; //String containig the hour. Format "[ HH:MM:SS ] " 
			
			if (users.indexOf(parseInt(tweet.user.id)) > -1){ //If the author of the tweet is in the user list:
				// Show on log (console) the info of the tweet detected, and inform that the RT is on process.
				followed++; // One more rt to the counter
				lastEvent = "@" + tweet.user.screen_name + " just tweeted! {Tweet id: " + tweet.id + "}"; //Update the last event (tweet detected, then proceded to post)
				postTweet(tweet); //Method that RTs the tweet with the previous code.
			} else{ //The tweet is not from the user list
				not_followed++; //One more tweet detected
				lastEvent = "Tweet detected from @" + tweet.user.screen_name + " (Not followed). {Tweet id: " + tweet.id_str + "}"; //Update the last event
				postNonTweet(tweet);
			}
			
			process.stdout.write('\033c'); //Used to clean the console 
			process.stdout.write(title + hour + "Since the bot started at "+ originalTime + ": Following " + users.length + " users | " + followed + " tweets from followed accounts | " + not_followed + " tweets detected from not followed.\n" + 
					"\t Last event: " + lastEvent); //Post the current bot's info

			reloadUsers();	//In case the user list is modified from the app or anywhere else, reolad the list (asyncronous).
		}catch(err){ //If there's an error during strean, reboot
			console.log("--> " + hour + "Exception catched. Rebooting"); //Inform error on console.
			console.log(err);
			writeError(err); //Save the error info in file.
			reloadUsers(); //Reload users.
			checkVariable(); //Paralize the program untill users ready.
		}
	})
}

/*
	Given a tweet and a code, the bot saves the tweet (followed user)
*/
function postTweet(tweet){
	//Post from the app, in form of RT and id, using the tweet.id_str, and executing the declared function.
	var jsonData = JSON.stringify(tweet);
	fs.writeFile("tweets_followed/tweet_" + tweet.id_str + ".json", jsonData, function(err) {
		if (err) {
			writeError(err);
		}
	});
}

/*
	Given a tweet and a code, the bot saves the tweet (followed user)
*/
function postNonTweet(tweet){
	//Post from the app, in form of RT and id, using the tweet.id_str, and executing the declared function.
	var jsonData = JSON.stringify(tweet);
	fs.writeFile("tweets_not_followed/tweet_" + tweet.id_str + ".json", jsonData, function(err) {
		if (err) {
			writeError(err);
		}
	});
}

/*
	This method loads on the users variable the list of ids that the bot follows.
*/
function reloadUsers(){
	//Get the friends(follows) id from the @AAAAAA user, and execute the following function.
	T.get('friends/ids', {screen_name: 'noticias_SLO'}, function (err, data, response) {
		if(!err){
			users = data.ids; //The users content is replaced with the obtained list in the data.ids field.
		
		}else{
			// GET application / rate_limit_status.
			//The twitter api doasn't respond or there's an error.
		}
	});
}

/*
*	Function that checks the users the account follows each 10 minutes
*/
function checkUsers(){
	updateUsers();	// Ask the API for the users
	setTimeout(checkUsers, 600000); //Repeat in 10m
}

function updateUsers(){
	//Get the friends(follows) id from the @AAAAAA user, and execute the following function.
	T.get('friends/ids', {screen_name: 'noticias_SLO'}, function (err, data, response) {
		if(!err){
			users = data.ids; //The users content is replaced with the obtained list in the data.ids field.
			
			
			
			var today = new Date(); //Get the day + hour the tweet is detected.
			var hour = "[ " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + " ] "; //String containig the hour. Format "[ HH:MM:SS ] " 
			lastEvent = "Users updated! New user count: " + users.length;

			process.stdout.write('\033c'); //Used to clean the console 
			process.stdout.write(title + hour + "Since the bot started at "+ originalTime + ": Following " + users.length + " users | " 
				+ followed + " RTs done | " + not_followed + " tweets detected.\n" + 
					"\t Last event: " + lastEvent); //Post the current bot's info

		} else{
			//writeError(err); //This error is too common and non important to waste disk space and log data
			// GET application / rate_limit_status.
			//The twitter api doasn't respond or there's an error.

		}
	})
}

/*
*	Given an Error object, the method writes in a json file the content of that error
*/ 
function writeError(error){

	var today = new Date(); //Get the current date and hour
	var date = today.getFullYear() + '_' + (today.getMonth()+1) + '_' + today.getDate(); //string with the date formated
	var hour = today.getHours() + "_" + today.getMinutes() + "_" + today.getSeconds(); //String with the hour fotmated
	var filename = 'err/' + date + "_" + hour + ".json"; //The txt log file is in the err directory, named after the date.
	
	var jsonData = JSON.stringify(error); // Convert the error object to json
	fs.writeFile(filename, jsonData, function(err) { //Write the .json file
		if (err) {
			writeError(err);
		}
	});
}
