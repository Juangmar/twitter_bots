var Twit = require('twit')
var T = new Twit({
	consumer_key: '***',
	consumer_secret: '***',
	access_token: '***',
	access_token_secret: '***',
})

var users;
var sec = 0;

console.log("Booting up...... success!");
console.log("Loading IDs...");
reloadUsers();
checkVariable();
var stream = T.stream('statuses/filter', {follow: users});

function checkVariable() {
	if (users != undefined) {
		process.stdout.write("IDs loaded after " + sec + " seconds! \n");
		stream = T.stream('statuses/filter', {follow: users});
		listen();
	} else{
		process.stdout.write("Downloading IDs. " + sec + " s...\r");
		sec++;
		reloadUsers();
		setTimeout(checkVariable, 1000);		
	}
}
 


function listen(){
	console.log("using the following users (" + users.length + "):");
	console.log(users);
	console.log("Now listening twitter accounts............");
	var code = 0;
	

	stream.on('tweet', function (tweet) {
			var today = new Date();
			var date =  today.getFullYear() + '_' + (today.getMonth()+1) + '_' + today.getDate();
			var filename = "log" + "\"" + date + ".txt";
			var hour = "[ " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + " ] ";
		if (users.indexOf(parseInt(tweet.user.id)) > -1){
			console.log(hour + "@" + tweet.user.screen_name + " just tweeted! Now retweeting... {code " + code + "}");
			postTweet(tweet, code);
			code++;
			reloadUsers();	
		} else{
			console.log(hour + "Tweet detected from @" + tweet.user.screen_name + " (Not followed)");
		}
	})
}

function postTweet(tweet, code){
	T.post('statuses/retweet/:id', {id: tweet.id_str}, function (err,data,response){
		console.log("\t" + "RT "+ code + " done!");
	})
}

function reloadUsers(){
	T.get('friends/ids', {screen_name: 'noticias_SLO'}, function (err, data, response) {
		users = data.ids;
	})
}