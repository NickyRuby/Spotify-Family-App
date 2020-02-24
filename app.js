const fetch = require('node-fetch');
const rp = require('request-promise');
const fs = require('fs');
const robert = require('./bot.js');
const url = 'https://api.spotify.com/v1/playlists/49XgBKp8BpRNV9OCfWcg8L/tracks';
const clientId = '277eaca42cad4bef8826cf7bac7e9c4d';
const clientSecret = '65adb2bc8d794d0e8c58741e5c5b6689';
let accessToken = 'BQD05KF90rclkyEsd7TnoalXPBGQ8Lr6t-g6Eoma41_d3S26cEt3eRirLIAlDihUDvuXy6vJYNz8BKQIk-Hc525BL1tbgHEHkXlY3ssLUy6WWuuehx27s5lQ9nTF7Z2j0sYYEOmC7bgLXj2U88Zn3fCW3y2ODMDU1MU';   
const TOKEN_URI = "https://accounts.spotify.com/api/token";
let tokenExpires;
let tokenExpired = true;



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
        console.log(token);
        accessToken = token.access_token;
        console.log(accessToken);
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
            console.log(item.track.images);
            tracks.push({
            artist: item.track.artists[0].name,
            track: item.track.name,
            link: item.track.external_urls.spotify,
            //cover: item.track.images[0].url + "?640x640",
            });
            console.log(item.track.images);
        });
    return tracks;
}

function sendTracksToChat(tracks) { // {[]}
    tracks.forEach(track => {
    let message = "🎶 " +  track.artist + " — " + track.track + "\n";
    robert.sendMessage(119821330, message, { reply_markup: {inline_keyboard: [[{text: "Cлушать", url: track.link}]]}});
    fs.appendFileSync('./tracks.txt', `\n${track.link}`, (err) => {
        if (err) {
            console.log(err);
        }
        });
     });
}


function comparePlaylist(receivedState){ // [{artist: "", track: "", link: ""}]
    
    console.log(receivedState);
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

    console.log(results);
    if (results.length > 0) sendTracksToChat(results);
    else console.log('Nothing new');
    
}


function search() {
    isTokenExpired();
    getTracks()
        .then(response => {
        let tracksList = getPlaylistTracks(response);
        comparePlaylist(tracksList); 
        }).catch(err => {
        console.log(err)
    });
}


setInterval(search, 1000);
