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

 app.get(/^(?!\/api\/)/, (req, res) => {
    let purl = url.parse(req.url, true);
    let pathname = 'pages' + purl.pathname;

    if ((pathname)[pathname.length - 1] === '/') {
        pathname += 'index';
    }
    res.render(pathname, purl.query);
});

app.get('/api/testing', (req, res) => {
    res.status(200).send('Hello world!');
});

// https://github.com/DevonCrawford/Personal-Website TEMPLATE

// J QUERY ??