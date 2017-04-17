module.exports = function (app, users, urlDatabase) {
  app.get('/urls/:id', (req, res) => {
    let userlinks = res.locals.userLinks,
        userShortLink = userlinks.find((obj) => obj.short === req.params.id);
    res.render('urls_show', userShortLink);
  });

  app.post('/urls/:id', (req, res) => {
    let urlObject = urlDatabase.find((obj) => obj.short === req.params.id);
    urlObject.long = req.body.longURL2;
    res.redirect('/urls');
  });

  app.post('/urls/:id/delete', (req, res) => {
    let urlIndex = urlDatabase.findIndex((obj) => obj.short === req.params.id);
    urlDatabase.splice(urlIndex,1);
    res.redirect('/urls');
  });
}