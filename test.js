const redis = require('redis');
const client = redis.createClient();

client.hmset("id", 13, "url", "https://open.spotify.com/track/4n23NofxtEOwrkWmAUspOa?si=bF44_2EMQNav3PQ6DwVxrw", "added_at", 
"04-04-20", "added_by", "me", "likes", 0);
client.hmset("id", 14, "url", "https://open.spotify.com/track/4n23NofxtEOwrkWmAUspOa?si=bF44_2EMQNav3PQ6DwVxrw", "added_at", 
"04-04-20", "added_by", "me", "likes", 0);
client.hmset("id", 15, "url", "https://open.spotify.com/track/4n23NofxtEOwrkWmAUspOa?si=bF44_2EMQNav3PQ6DwVxrw", "added_at", 
"04-04-20", "added_by", "me", "likes", 0);
client.hmset("id", 13, "url", "https://open.spotify.com/track/4n23NofxtEOwrkWmAUspOa?si=bF44_2EMQNav3PQ6DwVxrw", "added_at", 
"04-04-20", "added_by", "me", "likes", 0);

client.hgetall("id", (err,rep) => {
    if (err) console.log(err);
    else {
        console.log(rep);
    }
});

