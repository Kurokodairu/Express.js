const express = require('express')
const app = express()
const path = require("path");
const fs = require('fs');

const port = 3000;

const url = require("url");

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/static'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

 app.get(/^(?!\/api\/)/, (req, res) => {
    let purl = url.parse(req.url, true);
    let pathname = 'pages' + purl.pathname;

    if ((pathname)[pathname.length - 1] === '/') {
        pathname += 'index';
    }
    res.render(pathname, purl.query, {page: 'pathname'});
});


app.get('/api/testing', (req, res) => {
    res.status(200).send('Hello world!');
});

// https://github.com/DevonCrawford/Personal-Website TEMPLATE
