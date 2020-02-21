const fetch = require('node-fetch');
const fs = require('fs');
const readline = require('readline');
const express = require("express");
const robert = require('./bot.js');
const url = 'https://api.spotify.com/v1/playlists/49XgBKp8BpRNV9OCfWcg8L/tracks';
const cliendId = '277eaca42cad4bef8826cf7bac7e9c4d';
const app = express();
const PORT = process.env.PORT || 4001;
let accessToken = 'BQAVMSr_yv_hu4FubWBXnmd4JtJaXsvscB08ieGXl8xTyzK32Cpc-iVQeFNMAMj4_bH4VcMxFRV1CuQkdN7cK7hxaRZ2VRzp4xKXS8-5vyIftdtZpSbk0l_rkc81DN9ZqSq1_qfzcVBuRAidv8qPyp9GMnPgiffRQl8';   


app.listen(PORT);

app.get('/', (req,res,next) => {
    res.send('hello there');
})

app.get('/auth', (req,res,next) => {
    res.redirect(`https://accounts.spotify.com/authorize?client_id=${cliendId}&response_type=token&redirect_uri=https%3A%2F%2Flocalhost:4001%2Fcallback/`);
});


const getTracks = async () => {
    try {
const response = await fetch(url,
    {
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
          
        }
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
            artist: item.track.artists[0].name,
            track: item.track.name,
            link: item.track.external_urls.spotify,
            });
        });
    return tracks;
}

function sendTracksToChat(tracks) { // {[]}
    console.log(tracks);
    tracks.forEach(track => {
    let message = "🎶 " +  track.artist + " — " + track.track + "\n\n" + "⏯ " + `[Слушать](${track.link})` + "\n";
            robert.sendMessage(119821330, message, { parse_mode: "markdown"});
            fs.appendFileSync('./tracks.txt', `\n${track.link}`, (err) => {
                if (err) {
                    console.log(err);
                }
            });
     });
}


// TODO: Resolve chacking logic 

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



getTracks()
.then(response => {
    let tracksList = getPlaylistTracks(response);
    comparePlaylist(tracksList); 
    }).catch(err => console.log(err));