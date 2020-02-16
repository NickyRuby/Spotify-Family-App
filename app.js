
const fetch = require('node-fetch');
const express = require("express");
const robert = require('./bot.js');
const url = 'https://api.spotify.com/v1/playlists/49XgBKp8BpRNV9OCfWcg8L/tracks';
const cliendId = '277eaca42cad4bef8826cf7bac7e9c4d';
const clientSecret = '65adb2bc8d794d0e8c58741e5c5b6689'; 
const app = express();
const PORT = process.env.PORT || 4001;
let accessToken = 'BQDrnIBO99P8NaYxcFUiekDyOgXIE4LeQ8-SgItY-fUBEtIDZzcQ5i8vMJAZg-4zzN4FdH1cRlrWw6Nj7EMafeYiYbEKHsMcuM65oG1191RYQLgBtf0HvgcrjzRvFLVzNHlUuIUbkdLkHL8fl6cOVjfkkWqi_TECe_c';   

app.listen(PORT);

app.get('/', (req,res,next) => {
    res.send('hello there');
})

app.get('/auth', (req,res,next) => {
    res.redirect(`https://accounts.spotify.com/authorize?client_id=${cliendId}&response_type=token&redirect_uri=https%3A%2F%2Flocalhost:4001%2Fcallback/`);
});

app.get('/give', (req,res,next) => {

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

app.get('/login', function(req, res) {

    });


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

const hello = () => {
    console.log('hello');
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


hello();
getTracks()
.then(response => {
    let tracksList = getPlaylistTracks(response);
    message = "🎶 " +  tracksList[3].artist + " — " + tracksList[3].track + "\n\n" + "⏯ " + `[Слушать](${tracksList[3].link})`;
    robert.sendMessage(119821330, message, { parse_mode: "markdown"});
    })
.catch(err => console.log(err));
