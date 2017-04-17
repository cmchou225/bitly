//----Required libraries
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
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

app.use('/urls*', (req, res, next) => {
  if(!res.locals.user){
    next(401);
  } else {
    next();
  }
});



// Root page
app.get('/', (req, res) => {
  if(res.locals.user){
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//Registeration routes
app.get('/register', (req, res) => {
  if(res.locals.user){
    res.redirect('/');
    return;
  } else {
    let templateVars = { user: res.locals.users};
    res.render('urls_reg', templateVars);
    return;
  }
});

app.post('/register', (req, res) => {
  const userID = helperFunc.genRanString();
  const newEmail = req.body.email;
  const userInDB = users.find((obj) => obj.email === newEmail);

  if(!newEmail || !req.body.password){
    res.status(400).send('Please input both email and password. <a href="/register">Try again</a>');
  } else if(userInDB){
    res.status(400).send('Email entered already in use. Please <a href="/register">register</a> with another email');
  } else {
    let newUser = {
      id: userID,
      email: req.body.email
    };
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      newUser.password = hash;
      users.push(newUser);
      req.session.userEmail = req.body.email;
      res.redirect('/urls');
    });
  }
});
// LOGIN routes
app.get('/login', (req, res) => {
  if(res.locals.user){
    res.redirect('/');
    return;
  }
  res.render('urls_login');
});

app.post('/login', (req, res, next) => {
  let inputPw = req.body.password;
  let inputEmail = req.body.email;
  let userInDB = users.find((obj) => inputEmail === obj.email);
  if(!userInDB){
    res.status(403).send(`Account with email entered not found. <a href="/login">Try again</a>`);
  } else {
    let registeredPw = userInDB.password;
    bcrypt.compare(inputPw, registeredPw, function(err, result){
      if(result){
        req.session.userEmail = inputEmail;
        res.redirect('/');
      } else{
        res.status(401).send(`Unable to log in. Email or password entered incorrectly. <a href="/login">Try again</a>`);
      }
    });
  }
});

//Logout route
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

//URLs view and create route
app.get('/urls', (req, res) => {
  let templateVars = {
    user: res.locals.user,
    urls: res.locals.userLinks
  };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res, next) => {
  let randStr = helperFunc.genRanString();
  let userid = res.locals.uid;
  urlDatabase.push({
    id: userid,
    short: randStr,
    long: req.body.longURL
  });
  res.redirect(`/urls/${randStr}`);
});

app.get('/urls/new', (req, res, next) => {
  let templateVars = { user: res.locals.user};
  res.render("urls_new", templateVars);
});

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

app.get('/urls/:id', (req, res) => {
  let userlinks = res.locals.userLinks;
  let userShortLink = userlinks.find((obj) => obj.short === req.params.id);
  res.render('urls_show', userShortLink);
});

app.post('/urls/:id', (req, res) => {
  let urlObject = urlDatabase.find((obj) => obj.short === req.params.id);
  urlObject.long = req.body.longURL2;
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  let urlIndex = urlDatabase.findIndex((obj) => obj.short === req.params.id);
  urlDatabase.splice(urlIndex, 1);
  res.redirect('/urls');
});

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
app.use(function (err, req, res, next) {
  if(err === 401) {
    res.status(401).send(`Please sign in to view or edit links. <a href="/login">Sign in</a>`);
    return;
  } else if (err === 404){
    res.status(404).send(`The link you are trying to change does not exist. View your available links <a href="/urls">here</a>.`);
    return;
  } else if(err === 403){
    res.status(403).send(`Short link you are trying to access is not in your list of available links. View your available links <a href="/urls">here</a>.`);
    return;
  } else{
    res.send(`The page you are trying to access cannot be found. <a href="/">Try again</a>`);
  }
});

//Server startup
app.listen(PORT, () => {
  console.log(`Example app listneing on port ${PORT}!`);
});
