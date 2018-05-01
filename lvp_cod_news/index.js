var Twit = require('twit')
var T = new Twit({
	consumer_key: '***',
	consumer_secret: '***',
	access_token: '***',
	access_token_secret: '***',
})

var users = ["1148347748", "2785228156"];
var stream = T.stream('statuses/filter', {follow: users});
console.log("base users: "+ users);
console.log("Booting up...... success!");
console.log("Getting initial users ids......");
	
T.get('friends/ids', {screen_name: 'noticias_SLO'}, function (err, data, response) {
	users = data.ids;
	console.log(users);
	console.log("Those are the initial users!");
	console.log("Now listening twitter accounts............");
})

stream.on('tweet', function (tweet) {
	if (users.indexOf(tweet.user.id) > -1){

		var today = new Date();
		var date =  today.getFullYear() + '_' + (today.getMonth()+1) + '_' + today.getDate();
		var filename = "log" + "\"" + date + ".txt";
		var hour = "[ " + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + " ]";

		console.log(hour + " @" + tweet.user.screen_name + " just tweeted!");
		console.log("\t" + tweet.text);

		T.post('statuses/retweet/:id', {id: tweet.id_str}, function (err,data,response){
			console.log("\t" + "RT done!");
		})
		
		T.get('friends/ids', {screen_name: 'noticias_SLO'}, function (err, data, response) {
			users = data.ids;
			console.log("\t" + "Updating followed users...");
		  })

		console.log("\t" + "listening...............");
	}
})
