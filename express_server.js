//----Required libraries
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const helperFunc = require('./helperFunc');

//Engines
app.set('view engine', 'ejs');

//---Database
const urlDatabase = [
  {
    id: 'default',
    short: "b2xVn2",
    long: "http://www.lighthouselabs.ca"
  },
  {
    id: "default",
    short: "9sm5xK",
    long: "http://www.google.com"
  }
];

const users = [
  {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"

  },
  {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
];


// Middleware
app.use(cookieSession({
  name: 'session',
  keys: ['Lighthouse'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(bodyParser.urlencoded({extended: true}));

app.use((req, res, next) => {
  let user = users.find((obj) => req.session.userEmail === obj.email);
  if(user) {
    res.locals.user = user;
    res.locals.uid = user.id;
    res.locals.userLinks = helperFunc.userLinks(user.id, urlDatabase);
  } else {
    res.locals.user = null;
  }
  next();
});

//Authorization checking middleware

app.use('/urls*',(req, res, next) => {
  if(!res.locals.user){
    next(401);
  } else {
    next();
  }
});

require('./routes/auth_route')(app, helperFunc, users, urlDatabase);
require('./routes/Urls_route')(app, helperFunc, users, urlDatabase);

//Short URL checking middleware

app.use('/urls/:id', (req, res, next) => {
  res.locals.urlObject = urlDatabase.find((obj) => obj.short === req.params.id);
  if(!res.locals.urlObject){
    next(404);
  } else if(res.locals.urlObject.id !== res.locals.user.id){
    next(403);
  } else {
    next();
  }
});

//urls ID routes

require('./routes/linkEdit_routes')(app, users, urlDatabase);

//Public short link access route
app.get('/u/:shortURL', (req, res) => {
  let urlObject = urlDatabase.find((obj) => obj.short === req.params.shortURL);
  if(urlObject){
    let longURL = `${urlObject.long}`;
    res.redirect(longURL);
  } else {
    res.status(404).send(`The link you are looking for does not exist. Please double check and try again`);
  }
});

//Error Handling

require('./routes/errors')(app);

//Server startup
app.listen(PORT, () => {
  console.log(`Example app listneing on port ${PORT}!`);
});
