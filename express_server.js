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

  if(user){
    console.log("user found in cookie");
    console.log(user);
    res.locals.user = user;
  }
  else
    res.locals.user = null;
    console.log(res.locals.user);
    next();
});
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

//Registeration routes
app.get('/register', (req, res) => {
  let templateVars = { user: res.locals.users};
  res.render('urls_reg', templateVars);
});

app.post('/register', (req, res) => {
  const userID = generateRandomString();
  const newEmail = req.body.email;
  const inDB = users.find((obj) => obj.email === newEmail);
  //const userByEmail = users.find((userObj) => req.body.email === userObj.email);
  if(!newEmail || !req.body.password){
    console.log("there is some error");
    res.status(400);
    res.send('Please input both email and password');
  }
  else if(inDB){
    console.log("email already exists");
    res.status(400);
    res.send('Email in use');
  }
  else {

    console.log("ahh finally its working");
    let newUser = {
      id: userID,
      email: req.body.email
      };
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      newUser.password = hash;
      console.log(newUser);
      users.push(newUser);
      res.cookie('user_id', userID);
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
    res.cookie('user_id', userInDB["id"]);
    res.redirect('/urls');
  } else{
    res.status(403);
    res.send('Email and password mismatch');
  }

});


//URLs route
app.get('/urls', (req, res) => {
  let templateVars = {
    user: res.locals.user,
    urls: urlDatabase,
  };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  let randStr = generateRandomString();
  urlDatabase[randStr] = req.body.longURL;
  res.redirect(303, '/urls/');
  console.log(req.body, urlDatabase);
  // res.send("ok");
});

// url/new routes
app.get('/urls/new', (req, res) => {
  let templateVars = { user: res.locals.user};
  res.render("urls_new", templateVars);
});

//Logout route
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})

// Delete route
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

//urls ID route
app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL2;
  res.redirect('/urls');
});

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

//up Server
app.listen(PORT, () => {
  console.log(`Example app listneing on port ${PORT}!`);
});
