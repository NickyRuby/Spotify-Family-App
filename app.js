const fetch = require('node-fetch');
const fs = require('fs');
const express = require("express");
const robert = require('./bot.js');
const url = 'https://api.spotify.com/v1/playlists/49XgBKp8BpRNV9OCfWcg8L/tracks';
const clientId = '277eaca42cad4bef8826cf7bac7e9c4d';
const clientSecret = '65adb2bc8d794d0e8c58741e5c5b6689';
const app = express();
const PORT = process.env.PORT || 4001;
let accessToken = 'BQD05KF90rclkyEsd7TnoalXPBGQ8Lr6t-g6Eoma41_d3S26cEt3eRirLIAlDihUDvuXy6vJYNz8BKQIk-Hc525BL1tbgHEHkXlY3ssLUy6WWuuehx27s5lQ9nTF7Z2j0sYYEOmC7bgLXj2U88Zn3fCW3y2ODMDU1MU';   


app.listen(PORT);

app.get('/', (req,res,next) => {
    res.send('hello there');
})

app.get('/auth', (req,res,next) => {
    res.redirect(`https://accounts.spotify.com/authorize?client_id=${cliendId}&response_type=token&redirect_uri=https%3A%2F%2Flocalhost:4001%2Fcallback/`);
});

async function auth() {
    try {
            var encodedData = Buffer.from(clientId + ':' + clientSecret).toString('base64');
            var authorizationHeaderString = 'Authorization: Basic ' + encodedData;
            console.log(encodedData);
            console.log(authorizationHeaderString);

            await fetch('https://accounts.spotify.com/api/token', {
                body: "grant_type=client_credentials",
                header: {
                  authorizationHeaderString,
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "POST"
            }).then(response => {
                //console.log(response);
                let newToken =response.accessToken;
                accessToken = newToken;
                //https://accounts.spotify.com/api/token?clientId=
            });
            
    }
    catch (err) {
        console.log(err)
    }
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
            console.log(item.track.images       );
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
    console.log(tracks);
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


// function search() {
// getTracks()
// .then(response => {
//     let tracksList = getPlaylistTracks(response);
//     comparePlaylist(tracksList); 
//     }).catch(err => {
//         console.log(err)
//         if (err.message === 'The access token expired') {
//             auth();
//             search();
//         }
//     });
// }

// setInterval(search, 1000);


function test() {
auth();
}

test();