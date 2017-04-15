//----Required libraries
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

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
  keys: ['Bitly'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(bodyParser.urlencoded({extended: true}));

app.use((req, res, next) => {
  let user = users.find((obj) => req.session.userEmail === obj.email);
  if(user) {
    res.locals.user = user;
    res.locals.uid = user.id;
    res.locals.userLinks = userLinks(user.id, urlDatabase);
  } else
    res.locals.user = null;
  next();
});
//Error Handling



// app.use('/urls*', (req, res, next) => {
//   if(!res.locals.user){
//     res.status(401).send(`Please sign in to view or edit links. <a href="/login">Sign in</a>`);
//     return;
//   } else {
//     next();
//   }
// });


// Helper Func --- random string generator
function generateRandomString(){
  const x = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rnd = '';
  for( let i = 0; i < 6; i++){
    rnd += x.charAt(Math.floor(Math.random() * 62));
  }
  return rnd;
}
function userLinks (userid, array) {
  return array.filter((obj) => obj.id === userid)
};

function errorPage(code, message){};

// Root page
app.get('/', (req, res, next) => {
  if(res.locals.user){
    res.redirect('/urls');
  }
  res.redirect('/login');
  next();
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

app.post('/register', (req, res, next) => {     //Current ERROR TEST
  const userID = generateRandomString();
  const newEmail = req.body.email;
  const userInDB = users.find((obj) => obj.email === newEmail);

  if(!newEmail || !req.body.password){
    res.status(400);
    res.send('Please input both email and password. <a href="/register">Try again</a>');
  }

  else if(userInDB){
    res.status(400);
    res.send('Email entered already in use. Please <a href="/register">register</a> with another email');
  }

  else {
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
  let inputPw = req.body.password,
      inputEmail = req.body.email,
      userInDB = users.find((obj) => inputEmail === obj.email),
      registeredPw = "a";
  if(userInDB)
    registeredPw = userInDB.password
  bcrypt.compare(inputPw, registeredPw, function(err, result){
    if(result){
      req.session.userEmail = inputEmail;
      res.redirect('/urls');
    } else{
      res.status(403);
      res.send('Email and password mismatch');
    }
  });
});

//URLs route
app.get('/urls', (req, res, next) => {
  if(res.locals.user){
    let templateVars = {
      user: res.locals.user,
      urls: res.locals.userLinks
    }
    res.render('urls_index', templateVars);
    return;
  } else {
    // let err = new Error();
    // err.status = 401;
    next(401);  //ERROR THROWN CORRECTLY
  }
});

app.post('/urls', (req, res, next) => {
  if(res.locals.user){
    let randStr = generateRandomString();
    let userid = res.locals.uid;
    urlDatabase.push({
      id: userid,
      short: randStr,
      long: req.body.longURL
    });
    res.redirect(`/urls/${randStr}`);
  } else
  next(401); //Error works
});

// url/new routes
app.get('/urls/new', (req, res, next) => {
  if(res.locals.user){
    let templateVars = { user: res.locals.user};
    res.render("urls_new", templateVars);
    return;
  }
  next(401); // Works
});

//Logout route
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});

// Delete route
app.post('/urls/:id/delete', (req, res) => {
  let linkID = req.params.id;
  let index = urlDatabase.findIndex((obj) => obj.short === linkID);
  urlDatabase.splice(index,1);
  res.redirect('/urls');
});

//urls ID route
app.post('/urls/:id', (req, res) => {
  let linkID = req.params.id;
  let urlObject = urlDatabase.find((obj) => obj.short === linkID);
  urlObject.long = req.body.longURL2;
  res.redirect('/urls');
});

app.get('/urls/:id', (req, res) => {
  let shortID = req.params.id;
  let userlinks = res.locals.userLinks;
  let templateVars = userlinks.find((obj) => obj.short === shortID);
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  let shortID = req.params.shortURL;
  let urlObject = urlDatabase.find((obj) => obj.short === shortID);
  let longURL = `${urlObject.long}`;
  res.redirect(longURL);
});

//Error Handling
app.use(function (err, req, res, next) {
  if(err === 401) {
    res.status(401).send(`Please sign in to view or edit links. <a href="/login">Sign in</a>`);
    return;
  } else if (err === 403){

  }
  next();
});
//up Server
app.listen(PORT, () => {
  console.log(`Example app listneing on port ${PORT}!`);
});
