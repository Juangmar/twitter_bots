var Twit = require('twit')
var T = new Twit({
	consumer_key: '***',
	consumer_secret: '***',
	access_token: '***',
	access_token_secret: '***',
})
var users = ["1148347748", "2785228156"];
var stream = T.stream('statuses/filter', {follow: users});

console.log("Booting up...... success!");
console.log("Now listening twitter accounts............");

stream.on('tweet', function (tweet) {
	if (users.indexOf(tweet.user.id_str) > -1){
		console.log(tweet.user.name + " just tweeted!");
		console.log(tweet.text);
		T.post('statuses/retweet/:id', {id: tweet.id_str}, function (err,data,response){
			console.log("RT done!");
			console.log("listening...............");	
		})	
	}
})
