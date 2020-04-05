const redis = require('redis');
const client = redis.createClient();

client.hmset("user:1","id", 13, "url", "https://open.spotify.com/track/4n23NofxtEOwrkWmAUspOa?si=bF44_2EMQNav3PQ6DwVxrw", "added_at", 
"04-04-20", "added_by", "me", "likes", 0);
client.hmset("user:2","id", 14, "url", "https://open.spotify.com/track/4n23NofxtEOwrkWmAUspOa?si=bF44_2EMQNav3PQ6DwVxrw", "added_at", 
"04-04-20", "added_by", "me", "likes", 0);
client.hmset("user:4","id", 15, "url", "https://open.spotify.com/track/4n23NofxtEOwrkWmAUspOa?si=bF44_2EMQNav3PQ6DwVxrw", "added_at", 
"04-04-20", "added_by", "me", "likes", 0);
client.hmset("user:5","id", 16, "url", "https://open.spotify.com/track/4n23NofxtEOwrkWmAUspOa?si=bF44_2EMQNav3PQ6DwVxrw", "added_at", 
"04-04-20", "added_by", "me", "likes", 0);



client.keys('user:*',(err,rep) => {
    console.log(rep);
    rep.forEach(item => {
        client.hgetall(item,(err,rep) => {
            console.log(rep.url);
        })
    })
});