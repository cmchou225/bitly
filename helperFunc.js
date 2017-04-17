module.exports = {

  genRanString: function (){
    const x = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let rnd = '';
    for( let i = 0; i < 6; i++){
      rnd += x.charAt(Math.floor(Math.random() * 62));
    }
    return rnd;
  },
  userLinks: function (userid, array) {
    return array.filter((obj) => obj.id === userid);
  }
}