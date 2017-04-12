//----Required libraries
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');

// Middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

//---Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// --- random string generator
function generateRandomString(){
  const x = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rnd = '';
  for( let i = 0; i < 6; i++){
    rnd += x.charAt(Math.floor(Math.random() * 62));
  }
  return rnd;
}

//--GET request to home page
app.get('/urls', (req, res) => {
  let templateVars = {
    username: req.cookies['username'],
    urls: urlDatabase,
  };
  console.log(templateVars.username);
  res.render('urls_index', templateVars);
});

// Post request login to send cookies in response
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
})
// GET request for new path
app.get('/urls/new', (req, res) => {
  res.render("urls_new");
});

//POST request logout
app.post('/logout', (req, res) => {
  res.clearCookie('username');
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
    username: req.cookies['username'],
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
