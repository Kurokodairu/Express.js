const express = require('express');
const app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
require('dotenv').config();
const port = 8080;

const url = require("url");

// Using EJS as Template Files. https://ejs.co 
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/static'));
app.set('trust proxy', true);

app.listen(port, '127.0.0.1', () => console.log(`Example app listening on port ${port}!`));


// ----------------------------------------------------------------
// ESTABLISH A CONNECTION TO THE MONGO DATABASE

//connect to MongoDB
mongoose.connect(process.env.mongoURL);
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



// ----------------------------------------------------------------
// GET Routes for pages


// ROUT TO Root
app.get('/', function (req, res, next) {
  User.findById(req.session.userId)
  .exec(function (error, user) {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        return res.render('pages/index.ejs', {user: false});
      } else {
        return res.render('pages/index.ejs', {user: user});
      }
    }
  });
});

app.get('/auth', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (user === null) {
        res.render('pages/auth/index.ejs');
      } else {
        res.redirect('/');
      }
    });
});



// ----------------------------------------------------------------
// AUTHENTICATION


// Get the schema / template
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
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});

// GET for logout
app.get('/logout', function (req, res, next) {
  if (req.session) {
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});



// ----------------------------------------------------------------
// PROFILE PAGES


// GET route after registering - For personal profile
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

// GET Route for other profiles - With the id var
app.get('/profile/:id', (req, res, next) => {

  const userID = req.params.id;

  User.findOne({username: userID})
  .exec()
  .then(doc => {
      res.render('pages/profile/index.ejs', {
          user: doc
      });
  })
  .catch(err => {
      console.log(err);
  });
});

