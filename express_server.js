//----Required libraries
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

//Engines
app.set('view engine', 'ejs');

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

//-- App local variables
app.use((req, res, next) => {
  let user = users.find((obj) => req.cookies['user_id'] === obj.id);
  if(user)
    res.locals.user = user;
  else
    res.locals.user = null;
  console.log(res.locals.user);
  next();
})
//---Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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


// Root page
app.get('/', (req, res) => {
  res.send('helloooooo');
});

//Registeration path
app.get('/register', (req, res) => {
  res.render('urls_reg');
});

app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const newEmail = req.body.email;
  const inDB = users.find((obj) => obj.email === newEmail);
  //const userByEmail = users.find((userObj) => req.body.email === userObj.email);
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
    });
    res.cookie('user_id', userID);
    res.redirect('/');
  }
});

//--GET request to home page
app.get('/urls', (req, res) => {
  let templateVars = {
    user: res.locals.user,
    urls: urlDatabase,
  };
  res.render('urls_index', templateVars);
});

// Post request login to send cookies in response
app.post('/login', (req, res) => {
  res.cookie('user_id', req.body.username);
  res.redirect('/urls');
})
// GET request for new path
app.get('/urls/new', (req, res) => {
  let templateVars = { user: res.locals.user};
  res.render("urls_new", templateVars);
});

//POST request logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

//POST request from url/new path to add new short and long URL
app.post('/urls', (req, res) => {
  let randStr = generateRandomString();
  urlDatabase[randStr] = req.body.longURL;
  res.redirect(303, '/urls/' + randStr);
  console.log(req.body, urlDatabase);
  // res.send("ok");
});

// POST request to delete path to delete url from database
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//POST request to URLs ID path
app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL2;
  res.redirect('/urls');
});


//GET request to urls/id path
app.get('/urls/:id', (req, res) => {
  let templateVars = {
    user: res.locals.user,
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id]
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  let longURL = `${urlDatabase[req.params.shortURL]}`;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listneing on port ${PORT}!`);
});
