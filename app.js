
const fetch = require('node-fetch');
const express = require("express");
const url = 'https://api.spotify.com/v1/playlists/49XgBKp8BpRNV9OCfWcg8L/tracks';
const cliendId = '277eaca42cad4bef8826cf7bac7e9c4d';
const clientSecret = '65adb2bc8d794d0e8c58741e5c5b6689'; 
const app = express();
const PORT = process.env.PORT || 4001;
let accessToken = 'BQBLpIHjxq4Fl3phOnXWv1IkwbY_vNPHuGmRGYHS8yTfdm5Vkhz873Drpgu7e_tF8_LosnMUyfMw53Oxfa7mHSMwPAlIbRyf7ZVynom2oWxiLGB6txKdur_K6S8Su91Z3ytrauAGhtO-lWaoyoRlAHSZSllYNgATwrg';   

app.listen(PORT);

app.get('/', (req,res,next) => {
    res.send('hello there');
})

app.get('/auth', (req,res,next) => {
    res.redirect(`https://accounts.spotify.com/authorize?client_id=${cliendId}&response_type=token&redirect_uri=https%3A%2F%2Flocalhost:4001%2Fcallback/`);
});


app.get('/give', (req,res,next) => {

});

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

// const getAuth = async () => {
//     try {
//     let requestUrl = `https://accounts.spotify.com/authorize?client_id=${cliendId}&response_type=token&redirect_uri=https%3A%2F%2Flocalhost:4001%2Fcallback/`
//     const response = await fetch(requestUrl);   
//     return await response.json();
//     }
//     catch(err) {
//         console.log(err.message);
//     }
// }

// let authCode = getAuth();
hello();
getTracks().then(response => console.log(response)).catch(err => console.log(err));