module.exports = function (app, users, urlDatabase) {
  app.use(function (err, req, res, next) {
    if(err === 401) {
      res.status(401).send(`Please sign in to view or edit links. <a href="/login">Sign in</a>`);
      return;
    } else if (err === 404){
      res.status(404).send(`The link you are trying to change does not exist. View your available links <a href="/urls">here</a>.`);
      return;
    } else if(err === 403){
      res.status(403).send(`Short link you are trying to access not in your list of available links. View your available links <a href="/urls">here</a>.`);
      return;
    } else{
      res.status(404).send(`The page you are trying to access cannot be found. <a href="/">Try again</a>`)
    }
  });
}