const express = require('express')
const app = express()
const path = require("path");
const fs = require('fs');
var http = require('http')
const port = 8081;

const url = require("url");

// Using EJS as Template Files. https://ejs.co 
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/static'));
app.set('trust proxy', true);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));


// PAGES

//Root page
 app.get('/', (req, res) => {
    let purl = url.parse(req.url, true);
    let pathname = 'pages' + purl.pathname;

    if ((pathname)[pathname.length - 1] === '/') {
        pathname += 'index';
    }
    res.render(pathname, purl.query);
    console.log(purl.query);
});

//Users Page
app.get('/users/:id', function (req, res) {
    let id = req.params.id;

    let info = JSON.parse(fs.readFileSync('./user/'+id+'.json', 'utf8'));

    res.render('pages/users/index', {user: info});
});

app.get('/signup', function (req, res) {
    res.render('pages/signup/index');
});


// API TESTING


app.get('/api/user/:id', function (req, res) {
    let id = req.params.id;

    let info = JSON.parse(fs.readFileSync('./user/'+id+'.json', 'utf8'));

    res.render('pages/users/index', {user: info});
});



app.get('/api/signup/:name&:email', function (req, res) {
    let id = req.params.id;
    if(fs.existsSync('./user/' + id +".json")) {
        console.log("Exists");
    } else {
        console.log("Does not exist");
        fs.writeFile('./user/' + id + ".json");

    }
    res.send("Hello");
});