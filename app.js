const fetch = require('node-fetch');
const rp = require('request-promise');
const fs = require('fs');
const redis = require('redis');
const client = redis.createClient('redis://h:p8eacdec501aae153f1a0574d2b53a4deb2253772597ca7992245c633dd4c7a34@ec2-3-231-40-15.compute-1.amazonaws.com:19009')
require('dotenv').config();
const robert = require('./bot.js');
const url = 'https://api.spotify.com/v1/playlists/49XgBKp8BpRNV9OCfWcg8L/tracks';
// const clientId = process.env.CLIENT_ID;
// const clientSecret =  process.env.CLIENT_SECRET;
// let accessToken, tokenExpires, tokenExpired = true;
const clientId = '277eaca42cad4bef8826cf7bac7e9c4d';
const clientSecret =  '65adb2bc8d794d0e8c58741e5c5b6689';
let accessToken, tokenExpires = Date.now() / 1000;

 TOKEN_URI = "https://accounts.spotify.com/api/token";



function auth() {
    const opts = {
        method: 'POST',
        uri: TOKEN_URI,
        form: {grant_type: "client_credentials"},
        headers: {
            Authorization:"Basic " + Buffer.from(clientId + ":" + clientSecret, "ascii").toString("base64"),
        },
        json: true,
    };
    console.log('im here');
    rp(opts).then((token) => {
        tokenExpires = Date.now() / 1000 + 3200;
        accessToken = token.access_token;
    }); 
};


const getTracks = async () => {
    try {
        const response = await fetch(url,
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
            // console.log(item.track.images);
            tracks.push({
            artist: item.track.artists[0].name,
            track: item.track.name,
            link: item.track.external_urls.spotify,
            cover: item.track.album.images[0].url + `?${item.track.album.images[0].width}x${item.track.album.images[0].width}`,
            });
        });
    return tracks;
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

        client.llen('tracks',(err,rep) => {
            let newId = rep + 1;
            client.lpush('tracks', `${newId}`,track.link)
            });

     });
}


function comparePlaylist(receivedState){ 
    
    const results = [];

    client.llen('tracks',(err,rep) => {
        client.lrange('tracks',0,rep, (err,tracks) => {
            receivedState.forEach(item => {
                if (!tracks.includes(item.link)) { 
                    results.push(item); 
                    console.log(`New track added: ${item.artist} — ${item.track}`);
                }
                else return false;
                });
        
            if (results.length > 0) sendTracksToChat(results);
            else console.log('Nothing new');
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
        })
        .catch(err => {
        console.log(err)
    
    });
}
}

setInterval(search, 1000);
