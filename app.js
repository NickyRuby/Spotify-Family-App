const fetch = require('node-fetch');
const rp = require('request-promise');
const fs = require('fs');
require('dotenv').config();
const robert = require('./bot.js');
const url = 'https://api.spotify.com/v1/playlists/49XgBKp8BpRNV9OCfWcg8L/tracks';
// const clientId = process.env.CLIENT_ID;
// const clientSecret =  process.env.CLIENT_SECRET;
// let accessToken, tokenExpires, tokenExpired = true;
const clientId = '277eaca42cad4bef8826cf7bac7e9c4d';
const clientSecret =  '65adb2bc8d794d0e8c58741e5c5b6689';
let accessToken, tokenExpires, tokenExpired = true;

 TOKEN_URI = "https://accounts.spotify.com/api/token";



async function auth() {
    const opts = {
        method: 'POST',
        uri: TOKEN_URI,
        form: {grant_type: "client_credentials"},
        headers: {
            Authorization:"Basic " + Buffer.from(clientId + ":" + clientSecret, "ascii").toString("base64"),
        },
        json: true,
    };
    
    rp(opts).then((token) => {
        tokenExpires = Date().now / 1000 + 3200;
        accessToken = token.access_token;
        tokenExpired = false;
    }); 
};

function isTokenExpired(){
    const currentTime = Date().now / 1000 ;
    if (currentTime >= tokenExpires || tokenExpired) auth();

}


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
            //cover: item.track.images[0].url + "?640x640",
            });
            //console.log(item.track.images);
        });
    return tracks;
}

function sendTracksToChat(tracks) { // {[]}
    tracks.forEach(track => {
    let message = "🎶 " +  track.artist + " — " + track.track + "\n";
    robert.sendMessage(119821330, message, 
        { reply_markup: 
            {inline_keyboard: [[{text: "Cлушать", url: track.link}]]}
        });
    fs.appendFileSync('./tracks.txt', `\n${track.link}`, (err) => {
        if (err) {
            console.log(err);
        }
        });
     });
}


function comparePlaylist(receivedState){ // [{artist: "", track: "", link: ""}]
    
    const results = [];

    const tracks = fs.readFileSync('./tracks.txt', 'utf8', (err,data) => {
        if (err) throw err;
        const links = data.split(/\r?\n/);
        return links;
    });
    receivedState.forEach(item => {
        if (!tracks.includes(item.link)) { 
            results.push(item); 
            console.log('New track added');
        }
        else return false;
        });

    if (results.length > 0) sendTracksToChat(results);
    else console.log('Nothing new');
    
}


function search() {
    const currentTime = Date().now / 1000 ;
    if (currentTime >= tokenExpires || tokenExpired) auth();
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
