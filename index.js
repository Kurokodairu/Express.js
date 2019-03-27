const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
const port = 80;

const url = require("url");

// Using EJS as Template Files. https://ejs.co 
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/static'));
app.set('trust proxy', true);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));


//connect to MongoDB
mongoose.connect('mongodb://localhost/testForAuth');
var db = mongoose.connection;

//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // Connected.
});

//use sessions for tracking logins
app.use(session({
  secret: 'kurokodairu',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));


// ROUT TO Root
app.get('/', function (req, res, next) {
    res.render('pages/index.ejs');
});

app.get('/auth', function (req, res, next) {
    res.render('pages/auth/index.ejs');
});



var User = require('./mongoDB/schema');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//POST route for updating data
app.post('/', function (req, res, next) {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    }

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    console.log("Login Method:")
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        console.log("Wrong Email");
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        console.log("Success, but crashing...");
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

// GET route after registering
app.get('/profile', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return res.redirect('/');
        } else {
          return res.render('pages/profile/index.ejs', {user: user});
        }
      }
    });
});

// GET for logout
app.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});