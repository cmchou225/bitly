const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const bodyParser = require("body-parser");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString(){
  const x = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let rnd = '';
  for( let i = 0; i < 6; i++){
    rnd += x.charAt(Math.floor(Math.random() * 62));
  }
  return rnd;
}



app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let randStr = generateRandomString();
  urlDatabase[randStr] = req.body.longURL;
  res.redirect(303, '/urls/'+randStr);
  console.log(req.body, urlDatabase);
  // res.send("ok");
});

app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});
//
app.get("/urls/:id", (req,res) => {
  let templateVars = {
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  // let longURL =  ...
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listneing on port ${PORT}!`);
});
