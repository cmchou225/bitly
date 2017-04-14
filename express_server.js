//----Required libraries
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

//Engines
app.set('view engine', 'ejs');

// Middleware
app.use(cookieSession({
  name: 'session',
  keys: ['Bitly'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(bodyParser.urlencoded({extended: true}));

//-- App local variables
app.use((req, res, next) => {
  let user = users.find((obj) => req.session.userEmail === obj.email);
  if(user) {
    res.locals.user = user;
    res.locals.uid = user.id;
    res.locals.userLinks = userLinks(user.id, urlDatabase); // returns array of objects representing user link data
  }
  else
    res.locals.user = null;
  next();
});

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

// Root page
app.get('/', (req, res, next) => {
  if(res.locals.user)
    res.redirect('/urls');
  res.redirect('/login');
  next();
});

//Registeration routes
app.get('/register', (req, res) => {
  let templateVars = { user: res.locals.users};
  res.render('urls_reg', templateVars);
});

app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const newEmail = req.body.email;
  const inDB = users.find((obj) => obj.email === newEmail);

  if(!newEmail || !req.body.password){
    res.status(400);
    res.send('Please input both email and password');
  }

  else if(inDB){
    res.status(400);
    res.send('Email in use');
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
    res.render('urls_login');
});

app.post('/login', (req, res) => {
  let inputPw = req.body.password,
      inputEmail = req.body.email,
      userInDB = users.find((obj) => inputEmail === obj.email),
      registeredPw = "a";
  if(userInDB)
    registeredPw = userInDB.password
  let pwCorrect = bcrypt.compareSync(inputPw, registeredPw);

  if(userInDB && pwCorrect){
    req.session.userEmail = inputEmail;
    res.redirect('/urls');
  } else{
    res.status(403);
    res.send('Email and password mismatch');
  }

});


//URLs route
app.get('/urls', (req, res) => {
  if(!res.locals.user)
    res.redirect('/');
  let templateVars = {
    user: res.locals.user,
    urls: res.locals.userLinks
  };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  let randStr = generateRandomString();
  let userid = res.locals.uid;
  urlDatabase.push({
    id: userid,
    short: randStr,
    long: req.body.longURL
  });
  res.redirect(303, '/urls/');
});

// url/new routes
app.get('/urls/new', (req, res) => {
  if(!res.locals.user)
    res.redirect('/');
  let templateVars = { user: res.locals.user};
  res.render("urls_new", templateVars);
});

//Logout route
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
})

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

//up Server
app.listen(PORT, () => {
  console.log(`Example app listneing on port ${PORT}!`);
});
