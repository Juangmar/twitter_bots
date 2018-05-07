/*
*
*	Copyright (c) 2018 Juan Gómez-Martinho
*	MIT License
*
*	https://github.com/Juangmar
*
*/

var Twit = require('twit') //Loading twitter API
var T = new Twit({
	//Our app credentials. Obtained at https://apps.twitter.com/
	consumer_key: '***',
	consumer_secret: '***',
	access_token: '***',
	access_token_secret: '***',
})
var users; //Array of users IDs
var sec = 0; //Integer variable to count how many seconds it takes to get the users.

console.log("Booting up...... success!"); //Initial message. The app is running.
console.log("Loading IDs..."); // Message: The loading of users begin.
reloadUsers(); //User load begin
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
	console.log("Now listening twitter accounts............"); //The bot really starts now.
	var code = 0; // The initial code for the tweet that will be RTed.
	//Stream. Each time a tweet is detected, execute the code below.
	stream.on('tweet', function (tweet) {
		try{
				var today = new Date(); //Get the day + hour the tweet is detected.
				var date =  today.getFullYear() + '_' + (today.getMonth()+1) + '_' + today.getDate(); //String containing the date. Format "yyyy-mm-dd"
				var filename = "log" + "\"" + date + ".txt"; //Log file name. It's in the log directory, with the name log\yyyy-mm-dd.txt
				var hour = "[ " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + " ] "; //String containig the hour. Format "[ HH:MM:SS ] " 
			if (users.indexOf(parseInt(tweet.user.id)) > -1){ //If the author of the tweet is in the user list:
				// Show on log (console) the info of the tweet detected, and inform that the RT is on process.
				// [ HH:MM:SS ] @user_name just tweeted! Now retweeting... {code: 12345}
				console.log(hour + "@" + tweet.user.screen_name + " just tweeted! Now retweeting... {code: " + tweet.id + "}"); 
				postTweet(tweet); //Method that RTs the tweet with the previous code.
				code++; //Tweet RTd, so the unique code is incremented.
			} else{ //The tweet is not from the user list
				console.log(hour + "Tweet detected from @" + tweet.user.screen_name + " (Not followed)"); //Print log. Tweet detected but not RTed.
			}
			reloadUsers();	//In case the user list is modified from the app or anywhere else, reolad the list (asyncronous).
		}catch(err){
			console.log("--> " + hour + "Exception catched. Rebooting");
			reloadUsers();
			checkVariable();
		}
	})
}

/*
	Given a tweet and a code, the bot Rts it and prints the success message with the error.
*/
function postTweet(tweet){
	//Post from the app, in form of RT and id, using the tweet.id_str, and executing the declared function.
	T.post('statuses/retweet/:id', {id: tweet.id_str}, function (err,data,response){
		var today = new Date();
		var date =  today.getFullYear() + '_' + (today.getMonth()+1) + '_' + today.getDate();
		var filename = "log" + "\"" + date + ".txt";
		var hour = "[ " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + " ]";
		console.log(hour + " RT "+ tweet.id + " done!"); //Confirm the success of the {code} tweet RT.
		var jsonData = JSON.stringify(tweet);
		var fs = require('fs');
			fs.writeFile("log/tweet_" + tweet.id_str + ".json", jsonData, function(err) {
    			if (err) {
        			console.log(err);
   				}
			});
		/*
			WARNING: IN THE NEXT VERSION THIS FUNCTION WILL HAVE AN IF-ELSE
			TO PRINT THE SUCCESS OR THE ERROR.
		*/
	})
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
			//console.log(err);
			// GET application / rate_limit_status.
			//The twitter api doasn't respond or there's an error.
		}
	})
}

function checkUsers(){
	updateUsers();
	setTimeout(checkUsers, 600000);
}

function updateUsers(){
	//Get the friends(follows) id from the @AAAAAA user, and execute the following function.
	T.get('friends/ids', {screen_name: 'noticias_SLO'}, function (err, data, response) {
		if(!err){
			users = data.ids; //The users content is replaced with the obtained list in the data.ids field.
			var today = new Date();
			var date =  today.getFullYear() + '_' + (today.getMonth()+1) + '_' + today.getDate();
			var filename = "log" + "\"" + date + ".txt";
			var hour = "[ " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + " ]";
			console.log(hour + "Users checked!");
			console.log("\t New user count: " + users.length);
		}else{
			//console.log(err);
			// GET application / rate_limit_status.
			//The twitter api doasn't respond or there's an error.
		}
	})
}
