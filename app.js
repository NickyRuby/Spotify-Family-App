const fetch = require('node-fetch');
const fs = require('fs');
const express = require("express");
const robert = require('./bot.js');
const url = 'https://api.spotify.com/v1/playlists/49XgBKp8BpRNV9OCfWcg8L/tracks';
const cliendId = '277eaca42cad4bef8826cf7bac7e9c4d';
const clientSecret = '65adb2bc8d794d0e8c58741e5c5b6689'; 
const app = express();
const PORT = process.env.PORT || 4001;
let accessToken = 'BQDGAnskbW4Pbu8KGz-HbdSwZy30NZCPjg_lqk6LljBk6NBA0QcefKgmvkBGfTiF7H_voW0C_s96s86aeOvQ0WL9HrmXaZReHLO55lT772va8h8TwwxTgGquESmcP-e-N9kEcoknRNU72ZNFg_5rzyMDdmRbYd93x4I';   
let playlistState = require('./playlists_states.js');





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
            fs.appendFileSync('./tracks.txt', `${item.track.external_urls.spotify}\n`, (err) => {
                if (err) {
                    console.log(err);
                }
            });
            console.log(item.track.external_urls.spotify)   
        });
    //console.log(tracks);
    return tracks;
}

function comparePlaylist(playlistState, receivedState) {
    const diff =  receivedState.length - playlistState.tracks.length;
        if (diff >= 1) {
            const newTrack = receivedState[receivedState.length - 1];
            playlistState.tracks.push(newTrack);
            let message = "🎶 " +  newTrack.artist + " — " + newTrack.track + "\n\n" + "⏯ " + `[Слушать](${newTrack.link})` + "\n";
            robert.sendMessage(119821330, message, { parse_mode: "markdown"});
            fs.appendFileSync('./tracks.txt', `${newTrack.link}\n`, (err) => {
                if (err) {
                    console.log(err);
                }
            });
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