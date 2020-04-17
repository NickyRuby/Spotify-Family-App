const fetch = require('node-fetch');
require('dotenv').config();
const rp = require('request-promise');
require('dotenv').config();
const redis = require('redis');
const stringify = require('node-stringify');
const client = redis.createClient(process.env.REDIS_URL)
const robert = require('./bot.js');
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
    let allTracks = {items: [] };
    // console.log('im here');g
    const requestBody = {
        headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'  
        }
    }
    const request = async (url) => {
            try {
            fetch(url,requestBody).then(response => {
                // console.log('this is response');
                response.json().then(requestedData => { 
                    requestedData.items.forEach(item => allTracks.items.push(item));
                        if (requestedData.next !== null) {
                            request(requestedData.next,requestBody);
                            } else {
                                getPlaylistTracks(allTracks);
                            }
                    });
                
            });
            
        } catch (err) {
            console.log(err);
        }
    }

    request(process.env.PLAYLIST_URL);
}


// response -> [{artist, track, link}]
function getPlaylistTracks(response) {
    // console.log(response);
    let tracks =[];
    // console.log(response.items.length);
    response.items.forEach(item => {
            tracks.push({
            addedAt: item.added_at,
            addedBy: item.added_by.id,
            artist: item.track.artists[0].name,
            track: item.track.name,
            link: item.track.external_urls.spotify,
            cover: item.track.album.images[0].url + 
            `?${item.track.album.images[0].width}x${item.track.album.images[0].width}`,
            });
        });
    comparePlaylist(tracks);
}



function comparePlaylist(receivedState){ 
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

function sendTracksToChat(tracks) { 
    tracks.forEach(track => {
        let trackIndexInDB;
        client.keys('track:*', (err,keys)=> {
            console.log(`adding ${track.track} to database`);;
            trackIndexInDB = keys.length + 1;
            client.hmset(`track:${trackIndexInDB}`, 'id', trackIndexInDB, 'url', track.link, 'added_at', 
            track.addedAt, 'added_by', track.addedBy, 'likes', 0);

            console.log('index is' + trackIndexInDB);
            let message =  "🎶 " +  track.artist + " — " + track.track + "\n";
            robert.sendPhoto(process.env.FAMILY_CHAT_ID, track.cover, {
                caption: message, 
                reply_markup: 
                    {
                        inline_keyboard: [
                            [{text: "Cлушать", url: track.link}],
                            [{text: `🖤 0`, callback_data: `${trackIndexInDB}`}]
                        ]
                    }
                });
            });
        });

}


robert.on('callback_query', (callbackData) => {

    let trackIndex = callbackData.data;

    let answers = ['😌Дякую','🖤Спасибочки','👌Принято','💪Ух!','🚀Погнаали!','✨Заряд', '🔥Давай еще', '🥳Еее'];
    robertBot.answerCallbackQuery(callbackData.id,{ text: answers[Math.floor(Math.random() * Math.floor(9))]});
    
    console.log(trackIndex);
    client.hgetall(`track:${trackIndex}`,(err,rep) => {
       if (err) {
           console.log(err);
       }
       console.log('heres object data');
       console.log(rep);
       trackLikesAndUrl = { url: rep.url, likes: Number(rep.likes) + 1}

        newMarkup = {
            inline_keyboard: [
            [{text: "Cлушать", url: `${trackLikesAndUrl.url}`}],
            [{text: `🖤 ${trackLikesAndUrl.likes}`, callback_data: `${trackIndex}`}]
        ]
        };
    
        form = {
            chat_id: callbackData.message.chat.id,
            message_id: callbackData.message.message_id,
        }

        robert.editMessageReplyMarkup(newMarkup, form);
        client.hmset(`track:${trackIndex}`, 'likes', trackLikesAndUrl.likes); 
    });

 });

function search() {

    const currentTime = Date.now() / 1000;
  
    if (currentTime > tokenExpires) auth();
    else {
        getTracks()
        // .then(response => {
        // let tracksList = getPlaylistTracks(response);
        // comparePlaylist(tracksList); 
        // }).catch(err => {
        // console.log(err)
    
    // });
    }
}

// search();
setInterval(search, 1000);
// client.keys("*",(err,rep) => {
//     console.log(rep.length);
//     // rep.forEach(key => client.hgetall(key,(e,r) => {
//     //     console.log(r.name);
//     // }));
// });

// client.flushall();