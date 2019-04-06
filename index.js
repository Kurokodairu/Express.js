const express = require('express');
const app = express();
var bodyParser = require('body-parser');

var server = require('http').createServer(app);
var io = require('socket.io')(server);

var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

require('dotenv').config();
const moment = require('moment');
const port = 3000;


// Using EJS as Template Files. https://ejs.co 
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/static'));
app.set('trust proxy', true);


// app.listen(port, '0.0.0.0', () => console.log(`App listening on port ${port}! `));

server.listen(port, () => console.log(`Server started on port ${port}`));

// ----------------------------------------------------------------
// ESTABLISH A CONNECTION TO THE MONGO DATABASE


//connect to MongoDB
mongoose.connect(process.env.mongoURL, {useCreateIndex: true, useNewUrlParser: true});
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
        msg.find({}, function(err, x) {
        return res.render('pages/index.ejs', {user: false, msgs: x});
        });
      } else {
        msg.find({}, function(err, x) {
        res.render('pages/index.ejs', {user: user, msgs: x});
        });
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

app.get('/Post', function (req, res, next) {
  User.findById(req.session.userId)
  .exec(function (error, user) {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        return res.redirect('/');
      } else {
        res.render('pages/Messages/send.ejs');
      }
    }
  });
});

app.get('/settings', function (req, res, next) {
  User.findById(req.session.userId)
  .exec(function (error, user) {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        return res.redirect('/');
      } else {
        return res.render('pages/settings/index.ejs');
      }
    }
  });
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

app.get('/experiment', function (req, res, next) {
  res.render('pages/exp/index.ejs');

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
      pictureURL: req.body.picture || '/default.png',
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

// W.I.P
app.post('/newPic', function (req, res, next) {
if (req.body.newPic) {

  User.findByIdAndUpdate(req.session.userId, { pictureURL: req.body.newPic }, {new:true});
  res.redirect('/profile');

} else {
  return res.send('Nothing Changed.');
}

});



// ----------------------------------------------------------------
// Post Msg


var msg = require('./mongoDB/msgSchema');

app.post('/Post', function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          //Not logged in
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return res.redirect('/');
        } else {
          // Logged in
          if(req.body.content) {

          var msgData = {
            sender: user.username,
            content: req.body.content,
            time: moment().format('MMMM Do YYYY, h:mm:ss a'),
          }
      
          msg.create(msgData, function (error, msg) {
            if (error) {
              return next(error);
            } else {
              return res.redirect('/');
            }
          });
        } else {
          return res.send('All fields required');
        }
        }
      }
    });
});

