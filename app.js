const fetch = require('node-fetch');
const rp = require('request-promise');
require('dotenv').config();
const redis = require('redis');
const client = redis.createClient()
const robert = require('./bot.js');
const url = process.env.PLAYLIST_URL;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
let accessToken, tokenExpires = Date.now() / 1000;

function auth() {
    const opts = {
        method: 'POST',
        uri: process.env.TOKEN_URI,
        form: {grant_type: "client_credentials"},
        headers: {
            Authorization:"Basic " + Buffer.from(clientId + ":" + clientSecret, "ascii").toString("base64"),
        },
        json: true,
    };
    console.log('getting auth token');
    rp(opts).then((token) => {
        tokenExpires = Date.now() / 1000 + 3200;
        accessToken = token.access_token;
    }); 
};


const getTracks = async () => {
    try {
        const response = await fetch('https://api.spotify.com/v1/playlists/01v15y5gpCqnA5ePoAeMRV/tracks',
        {
            headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
            
            },
        });
        return await response.json();
    }
    catch(err) {
        console.log(err);
    }
}

// response -> [{artist, track, link}]
function getPlaylistTracks(response) {
    let tracks =[];
    response.items.forEach(item => {
            tracks.push({
            addedAt: item.added_at,
            addedBy: item.added_by.id,
            artist: item.track.artists[0].name,
            track: item.track.name,
            link: item.track.external_urls.spotify,
            cover: item.track.album.images[0].url + `?${item.track.album.images[0].width}x${item.track.album.images[0].width}`,
            });
        });
    return tracks;
}



// TODO: FIX LOGIC
function comparePlaylist(receivedState){ 
    console.log('comparing...')
    const results = [];
    let tracks = [];
    client.keys('track:*',(err,keys) => {
        if (keys.length === 0) {
            receivedState.forEach(item => results.push(item));
            sendTracksToChat(results);
            console.log('added for empty');
        }
        keys.forEach(key => { 
            client.hgetall(key,(err,rep)=> {
                tracks.push(rep.url);
                if (tracks.length === keys.length) {
                    receivedState.forEach(item => {
                        if (!tracks.includes(item.link)) { 
                            results.push(item); 
                            console.log(`New track added: ${item.artist} — ${item.track}`);
                        }
                        else return false;
                    });
                    if (results.length > 0) sendTracksToChat(results);
                    else console.log('Nothing new');
                }
            });
        });
        
    });
        

}

function sendTracksToChat(tracks) { // {[]}
    tracks.forEach(track => {
    let message =  "🎶 " +  track.artist + " — " + track.track + "\n";
    robert.sendPhoto(119821330, track.cover, {
        caption: message, 
        reply_markup: 
            {
                inline_keyboard: [
                    [{text: "Cлушать", url: track.link}]]
            }
        });
            console.log(track.track);
            client.keys('track:*', (err,keys)=> {
                console.log(`adding ${track.track} to database'`);;
                newId = keys.length + 1;
                client.hmset(`track:${newId}`, 'id', newId, 'url', track.link, 'added_at', 
                track.addedAt, 'added_by', track.addedBy, 'likes', 0);
            });
     });
}

function search() {

    const currentTime = Date.now() / 1000;
  
    if (currentTime > tokenExpires) auth();
    else {
        getTracks()
        .then(response => {
        let tracksList = getPlaylistTracks(response);
        comparePlaylist(tracksList); 
        }).catch(err => {
        console.log(err)
    
    });
}
}

setInterval(search, 1000);
// client.keys("*",(err,rep) => {
//     console.log(rep);
//     rep.forEach(key => client.hgetall(key,(e,r) => {
//         console.log(r);
//     }));
// });

// client.flushall();

