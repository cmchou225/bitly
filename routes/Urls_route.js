
module.exports = function (app, helperFunc, users, urlDatabase) {
  //URLs view and create route
  app.get('/urls', (req, res) => {
    let templateVars = {
      user: res.locals.user,
      urls: res.locals.userLinks
    }
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
}