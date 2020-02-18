const fetch = require('node-fetch');
const express = require("express");
const robert = require('./bot.js');
const url = 'https://api.spotify.com/v1/playlists/49XgBKp8BpRNV9OCfWcg8L/tracks';
const cliendId = '277eaca42cad4bef8826cf7bac7e9c4d';
const clientSecret = '65adb2bc8d794d0e8c58741e5c5b6689'; 
const app = express();
const PORT = process.env.PORT || 4001;
let accessToken = 'BQDotqQk7SrmYkduIMKIC05olG3rZmaU4R6CLrUn7blNuA6xBXTILDx90wU3OfVCY9uM3pKlDhIepvFCC_Mw0mgS73WmDfGLGjnADDSZLCvQSEJGNOAKCCxMNKKuZGe-4-PAr6mJbzfvt6phseXT_wnKOlkhI0yKFYs';   
let playlistState = require('./playlists_states.js');

app.listen(PORT);

app.get('/', (req,res,next) => {
    res.send('hello there');
})

app.get('/auth', (req,res,next) => {
    res.redirect(`https://accounts.spotify.com/authorize?client_id=${cliendId}&response_type=token&redirect_uri=https%3A%2F%2Flocalhost:4001%2Fcallback/`);
});


app.get('/tracks', (req,res,next) => {
    let tracks =[];
    getTracks()
.then(response => getPlaylistTracks(response))
.catch(err => console.log(err));
    response.items.forEach(item => {
            tracks.push({
            artist: item.track.artists[0].name,
            track: item.track.name,
            link: item.track.external_urls.spotify,
            })         
        });
    console.log(tracks);
    res.send(tracks);
})


app.get('/callback/:params', (req,res,next) => {
    res.send(req.params);
})


const getTracks = async () => {
const response = await fetch(url,
    {
        headers: {
          'Authorization': 'Bearer ' + accessToken,
          'Content-Type': 'application/json'
          
        }
    });
return await response.json();
}

// response -> [{artist, track, link}]
function getPlaylistTracks(response) {
    let tracks =[];
    response.items.forEach(item => {
            tracks.push({
            artist: item.track.artists[0].name,
            track: item.track.name,
            link: item.track.external_urls.spotify,
            })         
        });
    console.log(tracks);
    return tracks;
}

function comparePlaylist(playlistState, receivedState) {
    const diff =  receivedState.length - playlistState.tracks.length;
        if (diff >= 1) {
            const newTrack = receivedState[receivedState.length - 1];
            playlistState.tracks.push(newTrack);
            let message = "🎶 " +  newTrack.artist + " — " + newTrack.track + "\n\n" + "⏯ " + `[Слушать](${newTrack.link})` + "\n";
            robert.sendMessage(119821330, message, { parse_mode: "markdown"});
        }
        else return null;
}


// getTracks()
// .then(response => {
//     let tracksList = getPlaylistTracks(response);
//     let message = "🎶 " +  tracksList[3].artist + " — " + tracksList[3].track + "\n\n" + "⏯ " + `[Слушать](${tracksList[3].link})` + "\n";
//     robert.sendMessage(119821330, message, { parse_mode: "markdown"});
//     })
// .catch(err => console.log(err));

console.log(playlistState);
getTracks()
.then(response => {
    let tracksList = getPlaylistTracks(response);
    comparePlaylist(playlistState,tracksList); 
    console.log(playlistState);
    })
.catch(err => console.log(err));